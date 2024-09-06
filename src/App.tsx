import React, { useEffect, useState } from 'react';
import './App.css';
import './index.css';
import { UserIcon } from '@heroicons/react/16/solid';
import AnimatedNumbers from 'react-animated-numbers';

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
  const [cagnotte, setCagnotte] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add state for search term
  const [darkMode, setDarkMode] = useState(false);

  // Handle search input
  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value.toLowerCase()); // Update search term, making it lowercase
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  async function getApiData() {
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://zevent.fr/api', {
      method: 'GET',
      headers: {
        Origin: 'http://localhost:3000', // or your app's origin
      },
    });
    if (response.status === 429) {
      // Wait for 60 seconds before retrying
      setTimeout(getApiData, 60000);
    }
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: ApiData = await getApiData();
        setApiData(data);

        // Only set the cagnotte when fetching the API data, not during search
        if (data.donationAmount) {
          setCagnotte(data.donationAmount.number); // Update the state to trigger animation
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      setLoading(false);
    };

    fetchData(); // Call fetchData when the component mounts

    // Set up an interval to re-fetch the data every minute
    const interval = setInterval(fetchData, 60000); // 60000ms = 1 minute

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }); // Empty dependency array to only run once on mount

  // Filter the streamers based on the search term
  const filteredStreamers = apiData?.live.filter(streamer =>
    streamer.display.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="w-full px-5 p-4 bg-white dark:bg-darkBg text-black dark:text-darkText">
      {/* Add a button to toggle dark mode */}
      <div className="flex justify-end">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Toggle Dark Mode
        </button>
      </div>
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
            <h2 className="flex flex-1 justify-center items-center text-5xl font-black w-full align-center text-green-900">
              <AnimatedNumbers
                includeComma
                transitions={(index) => ({
                  type: "spring",
                  duration: index + 0.5,
                })}
                animateToNumber={cagnotte} // Use cagnotte state here
                fontStyle={{
                  fontSize: 40,
                  color: 'green',
                  fontWeight: 900,
                }}
                // @ts-ignore
                configs={[
                  { mass: 1, tension: 220, friction: 100 },
                  { mass: 1, tension: 180, friction: 130 },
                  { mass: 1, tension: 280, friction: 90 },
                  { mass: 1, tension: 260, friction: 140 },
                  { mass: 1, tension: 210, friction: 180 },
                ]}
              />
              €
            </h2>
            <div className='my-4'>
              <input
                type='text'
                name='search'
                placeholder='Chercher un streamer'
                className='w-full p-2 rounded-md border-gray-500 dark:border-darkCard dark:bg-darkCard'
                onChange={handleSearch} // Attach the handleSearch function to input changes
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredStreamers?.map((streamer, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-lg dark:bg-darkCard dark:text-darkText ${
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
