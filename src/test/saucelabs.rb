#!/usr/bin/env ruby

require 'rubygems'
require 'selenium-webdriver'

driver = nil
arsnova_url = nil

if ENV['TRAVIS']
  browser = ENV['BROWSER'].split(':')
  arsnova_url = ENV['ARSNOVA_URL']

  caps = Selenium::WebDriver::Remote::Capabilities.send browser[0]
  caps.version = browser[1]
  caps.platform = browser[2]
  caps['tunnel-identifier'] = ENV['TRAVIS_JOB_NUMBER']
  caps['name'] = "Travis ##{ENV['TRAVIS_JOB_NUMBER']}"

  driver = Selenium::WebDriver.for(
    :remote,
    :url => "http://#{ENV['SAUCE_USERNAME']}:#{ENV['SAUCE_ACCESS_KEY']}@localhost:4445/wd/hub",
    :desired_capabilities => caps)
else
  driver = Selenium::WebDriver.for :chrome
  arsnova_url = "http://localhost:8080/mobile/"
end

def driver.wait_for_element(*args)
  how, what = extract_args(args)

  wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds
  wait.until { find_element(how.to_sym, what).displayed? }
  find_element(how.to_sym, what)
end

driver.navigate.to arsnova_url

passed = true

# Perform role selection and log in
driver.wait_for_element(:id, "ext-matrixbutton-2").click # Teacher
driver.find_element(:id, "ext-matrixbutton-3").click # Guest
driver.find_element(:id, "ext-button-16").click # 'Yes' in popup
# Wait for log in...
driver.wait_for_element(:id, "ext-button-7").click # Create new session
# Create Session
driver.find_element(:id, "ext-element-172").click # set focus to 'name' field
driver.find_element(:id, "ext-element-172").clear
driver.find_element(:id, "ext-element-172").send_keys "test"
driver.find_element(:id, "ext-element-178").click # set focus to 'short name' field
driver.find_element(:id, "ext-element-178").clear
driver.find_element(:id, "ext-element-178").send_keys "test"
driver.find_element(:id, "ext-button-9").click # create session

if not driver.wait_for_element(:id, "ext-element-296").text.include? "test" # short name displayed in titlebar?
    print "verifyTextPresent failed"
    passed = false
end

# Teardown
driver.find_element(:id, "ext-matrixbutton-9").click # delete session
driver.find_element(:id, "ext-button-73").click # 'Yes' in popup
driver.wait_for_element(:id, "ext-button-5").click # Logout

driver.quit

raise 'tests failed' unless passed
