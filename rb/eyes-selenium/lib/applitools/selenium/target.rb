module Applitools
  module Selenium
    class Target
      def self.region(by, what)
        new.region(by, what)
      end

      def self.fully(toggle)
        new.fully(toggle)
      end

      def self.frame(input)
        new.frame(input)
      end

      def self.window
        new
      end

      def self.ignore_displacements(toggle)
        new.ignore_displacements(toggle)
      end

      def self.ignore(by, what)
        new.ignore(by, what)
      end

      def initialize
        @target = {}
      end

      def region(by, what)
        @target[:region] = {:type => by.to_s, :selector => what}
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

      def ignore(by, what)
        @target[:ignoreRegions] = [] if !@target[:ignoreRegions]
        @target[:ignoreRegions] << {type: by.to_s, selector: what}
        self
      end

      def to_socket_output
        @target.to_h
      end
    end # Applitools
  end # Selenium
end # Target
