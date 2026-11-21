export type Customer = {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  _links?: { self: { href: string } };
};

// What we send to the API when creating or editing a customer
export type CustomerInput = Omit<Customer, "_links">;

export type Training = {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: Customer;
};

export const API_URL =
  "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api";