require('eventmachine')
require('applitools/socket')
require('applitools/refer')
require('applitools/selenium/spec-driver')
require('applitools/universal-server')
require('applitools/version')
require('applitools/rectangle-size')
require('applitools/selenium/target')
require('ostruct')

module Applitools
  module Selenium
    class Eyes
      def initialize
        @eyes = nil
        @driverRef = nil
        @refer = ::Applitools::Refer.new
        @socket = ::Applitools::Socket.new
        @q = EM::Queue.new
        prepare_socket
      end

      def configuration
        @config ||= OpenStruct.new
      end

      def configure
        yield(configuration)
      end

      def open(driver, config = nil)
        _config = config || transform_config_keys(@config.to_h)
        _driver = driver.is_a?(Hash) && !!driver[:driver] ? driver[:driver] : driver
        @eyes = await(->(cb) {
          @driverRef = @refer.ref(_driver)
          @socket.request('Eyes.open', {driver: @driverRef, config: _config}, cb)
        })
        _driver
      end

      def check(checkSettings)
        await(->(cb) {
          @socket.request('Eyes.check', {eyes: @eyes, checkSettings: checkSettings}, cb)
        })
      end

      def close(throw_exception = false)
        result = await(->(cb) {
          @socket.request('Eyes.close', {eyes: @eyes}, cb)
          @refer.destroy(@driverRef)
        })
        if (throw_exception and result[:status] != "Passed")
          raise JSON.pretty_generate(result)
        else
          puts JSON.pretty_generate(result)
        end
      end

      def abort
        await(->(cb) {
          @socket.request('Eyes.abort', {eyes: @eyes}, cb)
          @refer.destroy(@driverRef)
        })
      end

      private 

        def transform_config_keys(config)
          puts 'hey'
          config_copy = config.dup
          if (config.key?(:app_name))
            config_copy[:appName] = config[:app_name]
            config_copy.delete(:app_name)
          end
          if (config.key?(:test_name))
            config_copy[:testName] = config[:test_name] 
            config_copy.delete(:test_name)
          end
          if (config.key?(:viewport_size))
            config_copy.delete(:viewport_size)
          end
          config_copy
        end

        def await(function)
          resolved = false
          cb = ->(result) {
            resolved = result
          }
          @q.push(function)
          @q.pop {|fn| fn.call(cb)}
          sleep 1 until !!resolved
          resolved
        end

        def prepare_socket
          socket_ip = '127.0.0.1'
          socket_port = 2107
          socket_uri = "ws://#{socket_ip}:#{socket_port}/eyes"
          ::Applitools::UniversalServer.run
          ::Applitools::UniversalServer.confirm_is_up(socket_ip, socket_port)
          connect_and_configure_socket(socket_uri)
        end

        def connect_and_configure_socket(uri)
          Thread.new do
            EM.run do
              @socket.connect(uri)
              @socket.emit('Session.init', {:commands => ::Applitools::Selenium::SpecDriver.commands, :name => 'rb', :version => ::Applitools::Selenium::VERSION})
              @socket.command('Driver.isEqualElements', ->(params) {
                ::Applitools::Selenium::SpecDriver.isEqualElements(nil, @refer.deref(params[:element1]), @refer.deref(params[:element2]))
              })
              @socket.command('Driver.executeScript', ->(params) {
                result = ::Applitools::Selenium::SpecDriver.executeScript(@refer.deref(params[:context]), params[:script], @refer.deref_all(params[:args]))
                qualifier = ->(input) {::Applitools::Selenium::SpecDriver.isElement(input)}
                @refer.ref_all(result, qualifier)
              })
              @socket.command('Driver.mainContext', ->(params) {
                ::Applitools::Selenium::SpecDriver.mainContext(@refer.deref(params[:context]))
              })
              @socket.command('Driver.parentContext', ->(params) {
                ::Applitools::Selenium::SpecDriver.parentContext(@refer.deref(params[:context]))
              })
              @socket.command('Driver.childContext', ->(params) {
                ::Applitools::Selenium::SpecDriver.mainContext(@refer.deref(params[:context]), @refer.deref(params[:element]))
              })
              @socket.command('Driver.findElement', ->(params) {
                result = ::Applitools::Selenium::SpecDriver.findElement(@refer.deref(params[:context]), params[:selector])
                @refer.ref(result)
              })
              @socket.command('Driver.findElements', ->(params) {
                result = ::Applitools::Selenium::SpecDriver.findElements(@refer.deref(params[:context]), params[:selector])
                result.each {|element| @refer.ref(element)}
              })
              @socket.command('Driver.getViewportSize', ->(params) {
                ::Applitools::Selenium::SpecDriver.getViewportSize(@refer.deref(params[:driver]))
              })
              @socket.command('Driver.setViewportSize', ->(params) {
                ::Applitools::Selenium::SpecDriver.setViewportSize(@refer.deref(params[:driver]), params[:size])
              })
              @socket.command('Driver.getTitle', ->(params) {
                ::Applitools::Selenium::SpecDriver.getTitle(@refer.deref(params[:driver]))
              })
              @socket.command('Driver.getUrl', ->(params) {
                ::Applitools::Selenium::SpecDriver.getUrl(@refer.deref(params[:driver]))
              })
              @socket.command('Driver.getDriverInfo', ->(params) {
                ::Applitools::Selenium::SpecDriver.getDriverInfo(@refer.deref(params[:driver]))
              })
              @socket.command('Driver.takeScreenshot', ->(params) {
                ::Applitools::Selenium::SpecDriver.takeScreenshot(@refer.deref(params[:driver]))
              })
            end # connect_and_configure_socket EM.run
          end # connect_and_configure_socket Thread.new
        end # connect_and_configure_socket
    end # Eyes
  end # Selenium
end # Applitools
