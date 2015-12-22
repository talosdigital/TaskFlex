#!/bin/bash

### Variables
work_dir="tfworkdir"

tdjobs_git_url="https://github.com/talosdigital/TDJobs"
tduser_git_url="https://github.com/talosdigital/TDUser"
taskflex_git_url="https://github.com/talosdigital/tasksecurity"

tdjobs_git_branch="develop"
tduser_git_branch="rc1"
taskflex_git_branch="develop"

tdjobs_dir="TDJobs"
tduser_dir="TDUser"
taskflex_dir="TaskFlex"

docker_compose_url="https://raw.githubusercontent.com/talosdigital/"`
                  `"tasksecurity/develop/raw/docker-compose.yml?token="`
                  `"AFBX9SSLBLs_kUEACzCB5MGLnQRPsz0xks5WeCixwA%3D%3D"

### Colors
red='\033[0;31m'
orange='\033[0;33m'
green='\033[0;32m'
blue='\033[0;36m'
nc='\033[0m' # No color

### Functions
setup_work_dir () {
  if [ -d $work_dir ] ; then
    printf "'${blue}$work_dir${nc}' directory already exists. This script uses"`
           `" '${blue}$work_dir${nc}' to run TaskFlex and its dependencies.\n"`
           `" Do you want to continue the execution of TaskFlex ? "`
           `" ${orange}(Content inside '${blue}$work_dir${orange}' may become"`
           `" corrupted)${nc} (Y/N): "
    while true; do
      read ans
      case $ans in
        [Yy]* ) : ; break;; # NOP
        [Nn]* ) error_exit 'Rejected working directory'; break;;
        * ) printf "Please, answer yes or no (Y/N): ";;
      esac
    done
  else
    mkdir $work_dir
  fi
  cd $work_dir
}
clean () {
  rm -rf $1
}
error_exit () {
  >&2 printf "\n${red}ERROR${nc}: $1\n"
  exit 1
}
# $1 - Repository URL
# $2 - Repository branch
# $3 - Destination directory
clone_repository () {
  printf "Cloning $3... "
  if [ -d $3 ] ; then
    printf "${orange}$3 folder already exists, omitting.${nc}\n"
  else
    if ! git clone -b $2 $1 $3 &> /dev/null ; then
      clean $3
      error_exit "Couldn't clone $3 repository, exiting."
    fi
    printf "${green}Done.${nc}\n"
  fi
}
require_installation () {
  printf "Checking $1 status... "
  if ! $1 --version &> /dev/null ; then
    error_exit "$1 is not installed or is not available for '$(pwd)' working"`
              `" directory"
  else
    printf "${blue}Installed.${nc}\n"
  fi
}
start_virtual_machine () {
  printf "Starting '$1'...\n"
  docker-machine start $1
  if [ $? -ne 0 ] ; then
    printf "${red}ERROR${nc}: Could not start the '$1' virtual machine, trying"`
          `" to continue anyways\n"
  fi
}
execute_fail_exit () {
  $1
  if [ $? -ne 0 ] ; then
    error_exit "'$1' command failed."
  fi
}

### Beginning of script
setup_work_dir

# Check if required programs are installed
require_installation git
require_installation docker
require_installation docker-compose

# Clone Repositories
clone_repository $tdjobs_git_url $tdjobs_git_branch $tdjobs_dir
clone_repository $tduser_git_url $tduser_git_branch $tduser_dir
clone_repository $taskflex_git_url $taskflex_git_branch $taskflex_dir

# Get the docker-compose file
printf "Downloading 'docker-compose.yml' file... "
curl -o docker-compose.yml $docker_compose_url &> /dev/null
if cat docker-compose.yml | grep 'Not Found' ; then
  error_exit "Could not download docker-compose.yml file from TaskFlex's"`
  `" repository."
else
  printf "${green}Done.${nc}\n"
fi

# Start virtual machine if needed.
printf "Checking docker-machine status... "
if ! docker-machine --version &> /dev/null ; then
  printf "${orange}Not installed.${nc}\n"
else
  printf "${blue}Installed.${nc}\n"
  printf "Docker Machine detected, please write the name of the machine to be"`
        `" started (default: 'default'): "
  read machine_name
  if [ "$machine_name" == "" ]; then
    machine_name='default'
  fi
  start_virtual_machine $machine_name
fi

# Build Docker containers
printf "Building images with compose...\n"
execute_fail_exit 'docker-compose build'
printf "${green}Docker images were built with compose succesfully.${nc}\n"

# Execute containers
printf "Starting containers in background mode...\n"
execute_fail_exit 'docker-compose up -d'
printf "${green}Docker containers were started succesfully.${nc}\n"

# Wait some seconds before trying to create the database
seconds=5
printf "Sleeping $seconds seconds before creating the database\n"
sleep $seconds

# Migrate TDJobs database.
printf 'Creating TDJobs database...\n'
execute_fail_exit "docker-compose run tdjobs_api rake db:create"
printf "${green}TDJobs database created.${nc}\n"

printf 'Migrating TDJobs database...\n'
execute_fail_exit "docker-compose run tdjobs_api rake db:migrate"
printf "${green}TDJobs database migrated.${nc}\n"

## Script finished succesfully
machine_ip="$(docker-machine ip $machine_name 2> /dev/null)"
if [ $? -ne 0 ] ; then
  printf "${green}TaskFlex is now running in 'localhost' or in your running"`
        `" virtual machine's ip${nc}\n"
else
  printf "${green}TaskFlex is now running in $machine_ip (${machine_name}'s"`
        `" ip)${nc}\n"
fi
