module Applitools
  module Selenium
    module Target
      extend self

      def region(by, what)
        {:region => {:type => by, :selector => what}}
      end

    end # Applitools
  end # Selenium
end # Target
