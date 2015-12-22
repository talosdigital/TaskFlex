require 'date'

module DateHelper
  def self.prettify(date, format = '%B %d / %Y')
    begin
      if date.is_a?(String)
        Date.parse(date).strftime(format)
      else
        date.strftime(format)
      end
    rescue
      date.to_s
    end
  end
end
