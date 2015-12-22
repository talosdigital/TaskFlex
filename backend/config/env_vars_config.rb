require 'json'

dest = Rails.root.join('config', 'environment_variables.rb').to_path
file = File.read(Rails.root.join('config', 'env_vars.json').to_path)
data = JSON.parse(file)

def concat(text)
  @text = '' if @text.nil?
  @text += "#{text}\n"
end

concat "# Change all this configuration as required in the config/env_vars.json file"
concat "# WARNING: Reloading server may be required if any change was made."
data.each_with_index do |(env, hash), index|
  concat "#{index > 0 ? 'els' : ''}if Rails.env.#{env}?"
  hash.each do |key, value|
    concat "  ENV['#{key}'] = '#{value}'"
  end
end
concat 'end'

File.write(dest, @text)
@text = nil
