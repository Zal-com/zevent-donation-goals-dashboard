import React, { useEffect, useState } from 'react';
import './App.css';
import './index.css';
import { UserIcon } from '@heroicons/react/16/solid';
import AnimatedNumbers from "react-animated-numbers";

interface ApiData {
  live: Streamer[];
  donationAmount: {
    number: number;
    formatted: string;
  };
  viewersCount: {
    number: number;
    formatted: string;
  };
}

interface Streamer {
  display: string;
  online: boolean;
  game: string;
  location: string;
  viewersAmount: {
    formatted: number;
  };
  donationGoal: DonationGoal;
}

interface DonationGoal {
  hidden: boolean;
  goals: Goal[];
  donationAmount: {
    formatted: string;
    number: number;
  };
}

interface Goal {
  amountRequired: {
    number: number;
    formatted: string;
  };
  title: string;
}

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [previousDonationAmount, setPreviousDonationAmount] = useState<number | null>(null);
  const [animate, setAnimate] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [cagnotte, setCagnotte] = useState<number | null>(null)

  async function getApiData() {
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://zevent.fr/api', {
      method: 'GET',
      headers: {
        Origin: 'http://localhost:3000', // or your app's origin
      },
    });
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (initialLoad) {
        setLoading(true);
      }

      try {
        const data: ApiData = await getApiData();
        if (apiData) {
          // Check if the donation amount has changed
          if (data.donationAmount.number !== apiData.donationAmount.number) {
            setPreviousDonationAmount(apiData.donationAmount.number);
            setAnimate(true);
            setTimeout(() => setAnimate(false), 1000); // Remove animation after 1s
          }
        }
        setApiData(data);
        setCagnotte(data.donationAmount?.number)
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      setLoading(false);
      setInitialLoad(false);
    };

    fetchData(); // Call fetchData when the component mounts

    // Set up an interval to re-fetch the data every minute
    const interval = setInterval(fetchData, 60000); // 60000ms = 1 minute

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [apiData, initialLoad]); // Include `apiData` in the dependency array to detect changes

  // Split donation amount into individual characters for the spin animation
  const renderSpinningNumbers = (formattedAmount: string) => {
    return formattedAmount.split('').map((char, index) => (
      <span key={index} className={`spin-number ${animate ? 'animate' : ''}`}>
        <span>{char}</span>
      </span>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <h1>Loading...</h1>
      ) : !apiData ? (
        <h1>Impossible de récupérer les données</h1>
      ) : (
        <div>
          <div className="w-full flex flex-col justify-center">
            <h1 className="flex flex-1 justify-center text-3xl font-bold w-full align-center">
              Cagnotte globale
            </h1>
            <h2
              className="flex flex-1 justify-center text-5xl font-black w-full align-center"
            >
              <AnimatedNumbers
              transitions={(index) => ({
                type: "spring",
                duration: index + 0.3,
              })}
              locale='fr-FR'
              animateToNumber={cagnotte!}
              fontStyle={{
                fontSize: 40,
                color: "green",
                fontWeight: 900,
              }}
              />
              €
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {apiData.live.map((streamer, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-lg ${
                  index % 5 === 0 ? 'col-span-2 row-span-2' : 'col-span-1'
                }`} // Bento style grid logic: larger items every 5th
              >
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">{streamer.display}</p>
                  {streamer.online ? (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      LIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-sm flex flex-row gap-2 items-center">
                  <UserIcon className="w-4 h-4 text-red-400" />
                  {`${streamer.viewersAmount?.formatted} viewers`}
                </p>
                <p>Game: {streamer.game}</p>
                {!streamer.donationGoal?.hidden && streamer.donationGoal.goals?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-bold text-lg">Donation goals</p>
                    <ul>
                      {streamer.donationGoal?.goals?.map((goal, idx) => (
                        <li
                          key={idx}
                          className={`${
                            streamer.donationGoal.donationAmount.number >= goal.amountRequired.number
                              ? 'text-green-900 font-bold'
                              : 'text-red-900'
                          }`}
                        >
                          {goal.amountRequired.formatted} - {goal.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>Cagnotte personnelle : {streamer.donationGoal?.donationAmount?.formatted}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
