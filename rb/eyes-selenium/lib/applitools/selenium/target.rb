module Applitools
  module Selenium
    class Target
      def self.region(by, what = nil)
        new.region(by, what)
      end

      def self.fully(toggle)
        new.fully(toggle)
      end

      def self.frame(input)
        new.frame(input)
      end

      def self.window
        new.window
      end

      def self.ignore_displacements(toggle)
        new.ignore_displacements(toggle)
      end

      def self.ignore(by, what = nil)
        new.ignore(by, what)
      end

      def initialize
        @target = {}
      end

      def region(by, what)
        if (!what && by.is_a?(::Applitools::Region))
          @target[:region] = by.to_socket_output
        else
          @target[:region] = {:type => by.to_s, :selector => what}
        end
        self
      end

      def fully(toggle: true)
        @target[:isFully] = toggle
        self
      end

      def frame(input)
        @target[:frame] = [] if !@target[:frame]
        @target[:frame] << input
        self
      end

      def ignore_displacements(toggle)
        @target[:ignoreDisplacements] = toggle
        self
      end

      def ignore(by, what = nil)
        @target[:ignoreRegions] = [] if !@target[:ignoreRegions]
        if (!what && by.is_a?(::Applitools::Region))
          @target[:ignoreRegions] << by.to_socket_output
        else
          @target[:ignoreRegions] << {type: by.to_s, selector: what}
        end
        self
      end

      def window
        fully
        self
      end

      def to_socket_output
        @target.to_h
      end
    end # Applitools
  end # Selenium
end # Target
