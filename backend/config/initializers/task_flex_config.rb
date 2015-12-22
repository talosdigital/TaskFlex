require Rails.root.join('lib', 'task_flex', 'configuration.rb')

# Load environment variables set in config/env_vars.json file
load Rails.root.join('config', 'env_vars_config.rb')

TaskFlex.configure do |conf|
  conf.categories = [
    {
      name: "Design & Arts",
      keyword: "design",
      # image: "fa-paint-brush"
      image: "cat-icon cat-icon-design"
    },
    {
      name: "Sales & Marketing",
      keyword: "sales",
      # image: "fa-dollar"
      image: "cat-icon cat-icon-sales"
    },
    {
      name: "Engineering",
      keyword: "engineering",
      # image: "fa-cogs"
      image: "cat-icon cat-icon-engineering"
    },
    {
      name: "Accounting & Consulting",
      keyword: "accounting",
      # image: "fa-line-chart"
      image: "cat-icon cat-icon-accounting"
    },
    {
      name: "Web & Software Dev",
      keyword: "dev",
      # image: "fa-code"
      image: "cat-icon cat-icon-dev"
    }
  ]
  conf.items_per_page = 3

  if Rails.env.production?
    conf.email_options = {
      images_url: { # Used for replace for absolute paths all image URLs in HTML
                    # templates
        scheme:  ENV['TASKFLEX_EMAIL_IMAGE_SCHEME'] || "https",
        host:    ENV['TASKFLEX_EMAIL_IMAGE_HOST'],
        path:    ENV['TASKFLEX_EMAIL_IMAGE_PATH']
      },
      href_url:  ENV['TASKFLEX_EMAIL_HREF'] || "http://taskflex.talosdigital.com/#/",
      from:      ENV['TASKFLEX_EMAIL_FROM'] || "TaskFlex",
      host:      ENV['TASKFLEX_EMAIL_HOST'],
      domain:    ENV['TASKFLEX_EMAIL_DOMAIN'],
      address:   ENV['TASKFLEX_EMAIL_ADDRESS'] || "smtp.gmail.com",
      port:      ENV['TASKFLEX_EMAIL_PORT'].to_i || 587,
      user_name: ENV['TASKFLEX_EMAIL_USER_NAME'],
      password:  ENV['TASKFLEX_EMAIL_PASSWORD']
    }
  else
    conf.email_options = {
      images_url: { # Used for replace for absolute paths all image URLs in HTML
                    # templates
        scheme: "https",
        host:   "dl.dropboxusercontent.com",
        path:   "/u/6569781/TaskFlex/"
      },
      href_url:  "http://localhost:8000/#/",
      from:      "TaskFlex DEV <development@taskflex.com>",
      host:      "taskflex.com",
      domain:    "taskflex.com",
      address:   "smtp.taskflex.com",
      port:      587,
      user_name: "development@taskflex.com",
      password:  "taskflex"
    }
  end
  load Rails.root.join('lib', 'task_flex', 'notificator', 'email_config.rb')
end
