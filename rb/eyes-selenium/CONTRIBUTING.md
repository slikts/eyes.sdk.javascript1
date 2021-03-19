## Setup

1. Install Ruby - either by getting it from [the language website](https://www.ruby-lang.org/en/downloads/), or through a version manager like [rvm](https://rvm.io) or [rbenv](https://github.com/rbenv/rbenv).
2. Install Bundler (for managing the dependencies) with `gem install bundler`
3. `bundle install` to install the dependencies

As part of the install, a copy of the universal SDK server is downloaded locally to be used at runtime.

If you want to see the server output when running your tests, start it in a new terminal window. It's saved to a `.bin` directory and the filename is based on the platform you're using. So for Mac, to launch the server it would be `.bin/app-macos`.

## Test

To run the tests you can use the test watcher - Guard.

To launch it, run `bundle exec guard` and then press `Enter`. It will run all of the tests. If you make a change in either a source or test file and save it, then just that test file will be run by Guard.

To run an individual test file you can invoke it with RSpec. E.g., `bundle exec rspec path/to/file`.

## Coverage Test

Coverage tests are generated using JavaScript. Assuming you already have a Node runtime, then run the following commands:

```
// if you're using yarn
yarn install
yarn run build

// if you're using npm
npm install
npm run build
```

To run the coverage tests, you can either:

- use Guard (e.g., after generating the coverage tests, when running guard, if you hit `Enter` the coverage tests will be found and run by Guard), or

- run them with RSpec (e.g., `bundle exec rspec spec/coverage/generic`)

You can also prefix environment variables as needed as part of the run.

```
APPLITOOLS_SHOW_LOGS=true APPLITOOLS_API_KEY=$APPLITOOLS_API_KEY_SDK bundle exec rspec spec/coverage/generic
```

## Debug

To debug a Ruby application we will use `pry`. It's a library which gives us the ability to set a breakpoint by statement (similar to how it's done in JavaScript).

The dependency is already installed, it just needs to be required. Then you set a breakpoint and run your script.

```rb
require('pry') # the require
binding.pry # the breakpoint statement
```

For more info, you can read the project readme of the pry gem being used ([link](https://github.com/deivid-rodriguez/pry-byebug#pry-byebug)).

