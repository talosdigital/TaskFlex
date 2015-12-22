module TaskFlex
  module Categories
    class Root < Grape::API

      desc 'gets all categories'
      get do
        present TaskFlex.configuration.categories
      end

      desc 'gets category by its keyword'
      params do
        requires :keyword, type: String, desc: 'The keyword of the wanted category'
      end
      get ':keyword' do
        categories = TaskFlex.configuration.categories
        found = false
        categories.each do |category|
          found = category[:keyword] == params[:keyword]
          if found
            present category
            break
          end
        end
        unless found
          error!("Couldn't find category with keyword: '#{params[:keyword]}'", :not_found)
        end
      end
    end
  end
end
