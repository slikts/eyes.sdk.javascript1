module Applitools
  module Selenium
    module Target
      extend self
      @target = {}

      def region(by, what)
        @target[:region] = {:type => by.to_s, :selector => what}
        self
      end

      def fully(toggle: true)
        @target[:isFully] = toggle
        self
      end

      def to_socket_output
        @target.to_h
      end
    end # Applitools
  end # Selenium
end # Target
