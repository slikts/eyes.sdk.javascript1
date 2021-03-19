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
  it('frame') do
    result = ::Applitools::Selenium::Target.frame('blah')
    expect(result.to_socket_output).to eql({:frame => ['blah']})
  end
  it('window') do
    result = ::Applitools::Selenium::Target.window
    expect(result.to_socket_output).to eql({})
  end
  it('ignore_displacements') do
    result = ::Applitools::Selenium::Target.ignore_displacements(true)
    expect(result.to_socket_output).to eql({ignoreDisplacements: true})
  end
  it('ignore selector') do
    result = ::Applitools::Selenium::Target.ignore(:css, '#overflowing-div')
    expect(result.to_socket_output).to eql({ignoreRegions: [{type: 'css', selector: '#overflowing-div'}]})
  end
  it('ignore region') do
    skip 'e.g., Target.ignore(Applitools::Region.new(50, 50, 100, 100))'
  end
end
