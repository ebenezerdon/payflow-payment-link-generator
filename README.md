# PayFlow - Payment Link Generator

PayFlow is a modern, static web application that allows small businesses to generate payment links instantly. Built by [Teda.dev](https://teda.dev), this tool demonstrates a complete frontend flow for creating products, managing links, and simulating a checkout experience.

## Features

- **Buildless Architecture**: Runs entirely in the browser using ES modules and jQuery.
- **AI Integration**: Uses WebLLM (running locally in the browser via WebGPU) to generate persuasive product descriptions.
- **Payment Simulation**: A realistic checkout page (`pay.html`) that simulates credit card processing.
- **Persistent Data**: Uses `localStorage` to save your created links and transaction history.
- **Responsive Design**: Beautiful, mobile-first UI built with Tailwind CSS.

## How to Use

1. Open `index.html` to view the landing page.
2. Click "Get Started" to enter the Dashboard (`app.html`).
3. Create a new payment link. Use the "AI Magic Write" button to generate a description.
4. Copy the generated link or click the "Open" icon.
5. The link opens `pay.html` with your product details. Fill in the dummy payment info to test the flow.

## File Structure

- `index.html`: Marketing landing page.
- `app.html`: Admin dashboard.
- `pay.html`: Public checkout page.
- `scripts/`: Modular JavaScript logic.
- `styles/`: Custom CSS overrides.

## Browser Requirements

For the AI features to work, please use a browser that supports WebGPU (Chrome 113+, Edge 113+, or Firefox Nightly).