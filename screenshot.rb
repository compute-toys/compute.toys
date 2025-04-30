#!/usr/bin/env ruby

require 'base64'
require 'fileutils'
require 'json'
require 'open-uri'
require 'net/http'
require 'rest-client'
require 'screenshot'
require 'tmpdir'

# Ensure required environment variables are present
unless ENV['BROWSERSTACK_USERNAME'] && ENV['BROWSERSTACK_ACCESS_KEY'] && ENV['URL']
  puts "Error: Required environment variables not set"
  puts "Please set: BROWSERSTACK_USERNAME, BROWSERSTACK_ACCESS_KEY, URL"
  exit 1
end

def generate_comment(screenshot, filename)
  <<~MARKDOWN
    ### Screenshot from BrowserStack
    **URL**: #{screenshot[:url]}
    **Device**: #{screenshot[:device]} (#{screenshot[:orientation]})
    **OS**: #{screenshot[:os]&.capitalize} #{screenshot[:os_version]}
    **Browser**: #{screenshot[:browser]}
    **Created**: #{screenshot[:created_at]}

    ![Screenshot](#{filename})
  MARKDOWN
end

def save_locally(screenshot, image_data)
  output_dir = "screenshots"
  FileUtils.mkdir_p(output_dir)

  # Generate filename with timestamp
  timestamp = Time.now.strftime("%Y%m%d_%H%M%S")
  filename = "screenshot_#{timestamp}.png"
  filepath = File.join(output_dir, filename)

  # Save the image
  File.binwrite(filepath, image_data)

  # Save the markdown
  comment = generate_comment(screenshot, "./#{filename}")
  comment_file = File.join(output_dir, "#{filename}.md")
  File.write(comment_file, comment)

  puts "Saved to:"
  puts "- #{filepath}"
  puts "- #{comment_file}"
end

def post_to_github(screenshot)
  repo = ENV['GITHUB_REPOSITORY']
  pr_number = ENV['GITHUB_PR_NUMBER']
  api_url = "https://api.github.com/repos/#{repo}/issues/#{pr_number}/comments"
  comment = generate_comment(screenshot, screenshot[:image_url])

  puts "Posting to GitHub PR..."
  response = RestClient.post(api_url,
    {
      body: comment
    }.to_json,
    {
      'Authorization' => "token #{ENV['GITHUB_TOKEN']}",
      'Accept' => 'application/vnd.github.v3+json',
      'Content-Type' => 'application/json'
    }
  )

  puts "Comment posted successfully!"
rescue => e
  puts "Error posting to GitHub: #{e.message}"
  puts e.backtrace
  exit 1
end

begin
  # Initialize BrowserStack client
  client = Screenshot::Client.new(
    :username => ENV['BROWSERSTACK_USERNAME'],
    :password => ENV['BROWSERSTACK_ACCESS_KEY']
  )

  # Configure screenshot parameters
  params = {
    :url => ENV['URL'],
    :wait_time => 5,
    :quality => "original",
    :orientation => "landscape",
    :browsers => [
      {
        :os => "OS X",
        :os_version => "Sequoia",
        :browser => "Chrome",
        # :device => "Samsung Galaxy Tab S10 Plus",
        :browser_version => nil,
        # :real_mobile => true
      }
    ]
  }

  puts "Taking screenshot of #{ENV['URL']}"
  request_id = client.generate_screenshots(params)
  puts "Screenshot requested. Request ID: #{request_id}"

  puts "Waiting for screenshots to complete..."
  until client.screenshots_done?(request_id)
    print "."
    sleep 5
  end
  puts "\nScreenshots completed!"

  # Process screenshots
  screenshots = client.screenshots(request_id)
  puts JSON.pretty_generate(screenshots)
  screenshots.each do |screenshot|
    puts "\nProcessing screenshot..."

    image_url = screenshot[:image_url]
    if image_url.nil? || image_url.empty?
      puts "Error: No image URL found in screenshot data"
      next
    end

    puts "Downloading from: #{image_url}"
    image_data = Net::HTTP.get(URI.parse(image_url))
    save_locally(screenshot, image_data)

    if ENV['GITHUB_TOKEN']
      post_to_github(screenshot)
    end
  end

  puts "\nDone!"
rescue => e
  puts "Error: #{e.message}"
  puts e.backtrace
  exit 1
end
