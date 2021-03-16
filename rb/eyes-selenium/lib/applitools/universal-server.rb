require('open-uri')
require('socket')
require('digest')
require('fileutils')

module Applitools
  module UniversalServer
    extend self

    def download
      return if File.exist?(filepath) && Digest::SHA256.file(filepath).to_s == expected_binary_sha

      base_url = 'https://github.com/applitools/eyes.sdk.javascript1/releases/download/test_eyes-universal%400.0.1'
      uri = URI.parse(base_url + "/#{filename}")
      create_server_directory
      puts "[eyes-selenium] Downloading Eyes universal server from #{uri}"
      File.write(filepath, URI.open(uri).read)
      FileUtils.chmod('+x', filepath)
      puts "[eyes-selenium] Download complete. Server placed in #{filepath}"
    end

    def run
      pid = spawn(filepath, [:out, :err] => [File::NULL, 'w'])
      Process.detach(pid)
    end

    def confirm_is_up(ip, port, attempt = 1)
      raise 'Universal server unavailable' if (attempt === 16)
      begin
        TCPSocket.new(ip, port)
      rescue Errno::ECONNREFUSED
        sleep 1
        confirm_is_up(ip, port, attempt + 1)
      end
    end

    private

      def expected_binary_sha
        case RUBY_PLATFORM
        when /mswin|windows/i
          '732619e99c8bd4926e11fb44f4eee1744ced3cd0274876c0cbe17b5fb5fbaa8a'
        when /linux|arch/i
          '85c2ed760a6f0084dcda631d6c20801465a640f5a9e1c0589762cc536a069791'
        when /darwin/i
          '9cc2ec97397050a71e628e2e8972eb408e025bb77b088e12316ce15c9d488ecc'
        else
          raise 'Unsupported platform'
        end
      end

      def filename
        case RUBY_PLATFORM
        when /mswin|windows/i
          'app-win.exe'
        when /linux|arch/i
          'app-linux'
        when /darwin/i
          'app-macos'
        else
          raise 'Unsupported platform'
        end
      end

      def filepath
        File.expand_path(filename, '.bin')
      end

      def create_server_directory
        Dir.mkdir('.bin') if (!File.directory?('.bin'))
      end
  end
end

