# Food Delivery Frontend

Frontend project for a food delivery service.

## Technology Stack

- HTML
- CSS
- JavaScript (Vanilla)
- Fetch API
- History API for client-side routing

## Implemented Pages

- `/` — menu page
- `/login` — authorization
- `/registration` — registration
- `/profile` — user profile
- `/cart` — shopping cart
- `/orders` — order list
- `/order/{id}` — order details
- `/purchase` — order creation
- `/item/{id}` — dish details

## Main Features

- authorization and registration
- phone mask for Russian phone numbers
- centralized state management
- centralized API service
- client-side routing with History API
- menu filtering, sorting, and pagination through query parameters
- cart management
- purchase flow
- orders and order details
- delivery confirmation for active orders
- dish details and rating display

## Run Locally

### Recommended Method

project uses client-side routing with the History API.

To make page refresh work correctly on routes such as:

- `/login`
- `/registration`
- `/profile`
- `/cart`
- `/orders`
- `/purchase`
- `/item/{id}`
- `/order/{id}`

run the project with an SPA-friendly local server.

Install `serve` globally:

```bash
npm install -g serve

then start the project by 

serve -s . -l 5500

then open 

http://localhost:5500/

