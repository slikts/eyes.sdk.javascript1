module Applitools
  module Selenium
    module Target
      extend self

      def region(by, what)
        {:target => 'region', :region => what}
      end

    end # Applitools
  end # Selenium
end # Target
