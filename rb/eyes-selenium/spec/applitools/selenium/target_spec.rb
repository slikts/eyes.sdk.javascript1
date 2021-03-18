require_relative('../../../lib/applitools/selenium/target')

describe 'Target' do
  it('region') do
    result = ::Applitools::Selenium::Target.region(:css, 'div')
    expect(result.to_socket_output).to eql({:region => {:type => 'css', :selector => 'div'}})
  end
  it('region with fully') do
    result = ::Applitools::Selenium::Target.region(:css, 'div').fully
    expect(result.to_socket_output).to eql({:region => {:type => 'css', :selector => 'div'}, :isFully => true})
  end
end
