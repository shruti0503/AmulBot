# Playwright Scraper

This project is a web scraping application built using Node.js and Playwright. It is designed to check the stock status of products on a specified website and send notifications when products are available.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/playwright-scraper.git
   ```

2. Navigate to the project directory:
   ```
   cd playwright-scraper
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Install Playwright browsers:
   ```
   npx playwright install
   ```

## Usage

1. Create a `.env` file in the root directory and add your email credentials and other necessary environment variables.

2. Run the application:
   ```
   npm start
   ```

3. The application will check the stock status of the specified products at regular intervals and send notifications if any products are in stock.

## Environment Variables

- `EMAIL_USER`: Your email address for sending notifications.
- `EMAIL_PASS`: Your email password or app-specific password.
- `NOTIFY_EMAIL`: The email address to receive stock notifications.
- `PORT`: The port on which the server will run (default is 3000).

## License

This project is licensed under the MIT License.