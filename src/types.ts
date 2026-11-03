export type Customer = {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
};

export type Training = {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: Customer;
};

export const API_URL =
  "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api";