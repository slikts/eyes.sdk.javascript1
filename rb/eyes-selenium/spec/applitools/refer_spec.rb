require_relative('../../lib/applitools/refer')
require_relative('../spec_helper')

describe 'refer' do
  before(:each) do
    @refer = ::Applitools::Refer.new
  end
  it('should store an entry') do
    input = {:blah => 'blah'}
    @refer.ref(input)
    expect(@refer.store.values.first).to eq(input)
  end
  it('should return a server compatible element reference') do
    input = {:blah => 'blah'}
    result = @refer.ref(input)
    expect(result.keys.first).to eq(::Applitools::Refer::REF_ID)
    expect(result.values.first).to_not be_nil
  end
  it('should track element relation') do
    parentRef = @refer.ref({:a => 'a'})
    @refer.ref({:b => 'b'}, parentRef)
    expect(@refer.relation.keys.first).to eq(parentRef.values.first)
  end
  it('should confirm ref identity') do
    ref = @refer.ref({:a => 'a'})
    expect(@refer.isRef(ref)).to eq(true)
    expect(@refer.isRef({})).to eq(false)
    badRef = nil
    expect(@refer.isRef(badRef)).to eq(false)
    anotherBadRef = [:chunkByteLength, 26214400]
    expect(@refer.isRef(anotherBadRef)).to eq(false)
  end
  it('should return the original value') do
    input = {:a => 'a'}
    ref = @refer.ref(input)
    expect(@refer.deref(ref)).to eq(input)
    expect(@refer.deref({})).to eq({})
  end
  it('should return the original value when the key is a symbol string') do
    input = 'blah'
    ref = @refer.ref(input)
    modifiedRef = {:"#{::Applitools::Refer::REF_ID}" => ref.values.first}
    # this is the shape of a ref when received through the socket
    expect(@refer.deref(modifiedRef)).to eq(input)
  end
  it('should destroy a ref') do
    parentRef = @refer.ref({:a => 'a'})
    ref = @refer.ref({:b => 'b'}, parentRef)
    @refer.destroy(parentRef)
    expect(@refer.store.keys.include?(parentRef.values.first)).to eq(false)
  end
  it('should destroy a ref when the key is a symbol string') do
    parentRef = @refer.ref({:a => 'a'})
    @refer.ref({:b => 'b'}, parentRef)
    modifiedParentRef = {:"#{::Applitools::Refer::REF_ID}" => parentRef.values.first}
    @refer.destroy(modifiedParentRef)
    expect(@refer.store.keys.include?(modifiedParentRef.values.first)).to eq(false)
  end
  it('should deref all relevant parts of a given collection') do
    # shallow collection w/o a ref
    input = [{:chunkByteLength=>262144000, :serializeResources=>true, :compressResources=>false, :skipResources=>[], :removeReverseProxyURLPrefixes=>false}]
    expect(@refer.deref_all(input)).to eq(input)
    # shallow collection with a ref
    actual = [@refer.ref({:a => 'a'})]
    expected = [{:a => 'a'}]
    expect(@refer.deref_all(actual)).to eq(expected)
    # simulates what setElementMarkers snippet sends in executeScript
    actual = [[[@refer.ref({:b => 'b'})],[]]]
    expected = [[[{:b => 'b'}],[]]]
    expect(@refer.deref_all(actual)).to eq(expected)
  end
  it('should ref all relevant parts of a given collection') do
    input = [{:a => 'a'}, {:b => 'b'}]
    isA = ->(input) {input.values.first === 'a'}
    result = @refer.ref_all(input, isA)
    expect(result.first.keys.first).to eq(::Applitools::Refer::REF_ID)
  end
  # e.g., from JS POC
  #async function serialize(result) {
  #  const [_, type] = result.toString().split('@')
  #  if (type === 'array') {
  #    const map = await result.getProperties()
  #    return Promise.all(Array.from(map.values(), serialize))
  #  } else if (type === 'object') {
  #    const map = await result.getProperties()
  #    const chunks = await Promise.all(
  #      Array.from(map, async ([key, handle]) => ({[key]: await serialize(handle)})),
  #    )
  #    return Object.assign(...chunks)
  #  } else if (type === 'node') {
  #    return ref(result.asElement(), frame)
  #  } else {
  #    return result.jsonValue()
  #  }
  #}
end
