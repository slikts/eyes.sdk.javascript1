require 'faye/websocket'
require 'json'

module Applitools
  class Socket
    attr_reader :listeners

    def initialize
      @listeners = {}
    end

    def connect(uri, ws)
      @socket = ws ? ws : ::Faye::WebSocket::Client.new(uri)

      ws.on :message do |event|
        message = JSON.parse(event.data).values
        params = [message[:payload], message[:key]]
        find_and_execute_listeners_by_name(message[:name], params)
        find_and_execute_listeners_by_name("#{name}/#{key}", params) if (key)
      end

      ws.on :close do |event|
        find_and_execute_listeners_by_name('close')
      end
    end

    def emit(message, payload)
      @socket.send(serialize(message, payload))
    end

    def command(name, fn)
      on(name, ->(payload, key) {
        begin
          puts "[COMMAND] #{name}, #{key}, #{JSON.generate(payload)}"
          result = fn.call(payload)
          emit({name: name, key: key}, result)
        rescue => error
          emit({name: name, key: key}, error.message)
        end
      })
    end

    private

      def find_and_execute_listeners_by_name(name, params = [])
        fns = listeners[name.to_sym]
        return if (!fns)
        fns.each {|fn| fn.call(*params)}
      end

      def serialize(type, payload)
        message = type.is_a?(String) ? 
          {:name => type, :payload => payload} : {:name => type[:name], key: type[:key], :payload => payload}
        JSON.generate(message)
      end

      def on(type, fn)
        name = type.is_a?(String) ? type : "#{type[:name]}/#{type[:key]}"
        fns = listeners[name.to_sym]
        if (!fns)
          fns = []
          listeners[name.to_sym] = fns
        end
        fns.push(fn)
        # NOTE:
        # There's no return here like in the JS POC
        # e.g., https://github.com/applitools/eyes.sdk.javascript1/blob/poc/universal-ruby-sdk/packages/eyes-universal/src/socket.js#L85
        # The closest thing to returning a function would be something like this:
        # `->() { off(name, fn)`.
        # It would need to receive `.call` to run though. It's unclear to me how 
        # this return function is used, so I've omitted it for now.
      end

  end
end
