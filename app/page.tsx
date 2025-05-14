import { Checkout } from "./components/checkout";

export default function Home() {
  const articles = [
    {
      price_data: {
        currency: "gbp", // Par défaut GBP, mais à rendre dynamique
        product_data: {
          name: "Plan Standard",
          description: "15 GBP/utilisateur/mois",
        },
        unit_amount: 1500, // en centimes => 15.00 GBP
        recurring: {
          interval: "month",
        },
      },
      quantity: 1,
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold">Choisissez votre plan</h1>
        <p className="mt-3 text-xl">
          Abonnement à 15 GBP / utilisateur / mois
        </p>
        <Checkout articles={articles} />
      </main>
    </div>
  );
}

