require_relative('../../lib/applitools/configuration')

describe 'configuration' do
  before(:all) do
    @config = ::Applitools::Configuration
  end
  it('config block') do
    @config.configure do |config|
      config.app_name = 'app'
      config.test_name = 'test'
      config.branchName = 'branch'
    end
    expect(@config.configuration[:appName]).to eql('app')
    expect(@config.configuration[:testName]).to eql('test')
    expect(@config.configuration[:app_name]).to eql(nil)
    expect(@config.configuration[:test_name]).to eql(nil)
    expect(@config.configuration[:branchName]).to eql('branch')
  end
end
