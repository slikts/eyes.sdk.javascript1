module Applitools
  module Selenium
    module Target
      extend self

      def region(by, what)
        {by => what}
      end

    end # Applitools
  end # Selenium
end # Target
