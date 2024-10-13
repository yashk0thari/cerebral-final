"use client";

import React, { useState, useEffect } from "react";
import * as shadcn from "@/components/ui";
import Navbar from "@/components/ui/navbar";
import { db } from "@/app/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface Analytics {
  id: string;
  name: string;
  interactions: number;
  Pageviews: number;
  Pageleaves: number;
  AutoCapture: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [combinationCounts, setCombinationCounts] = useState<{ [key: string]: 
    { interactions: number; 
      name: string;
      pageview: number;
      web_vitals: number;
      pageleave: number;
      autocapture: number
     } }>({});
  const [loading, setLoading] = useState(true);  // Loading state
  const [keysList, setKeysList] = useState<string[]>([]); // List of keys
  const [totalKeys, setTotalKeys] = useState<number>(0);  // Total count of keys
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state

  useEffect(() => {
    const fetchPosthogData = async () => {
      setLoading(true);
      const url = "https://us.posthog.com/api/projects/97054/events/";

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer phx_lxYUFhtlJQljqPQaMG4SSG2jJoY0RgDG8ZDlJzWLc2uXUfg`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("PostHog Events Data:", data);

        const newCombinationCounts: { [key: string]: 
          { 
            interactions: number;
            name: string;
            pageview: number; 
            web_vitals: number; 
            pageleave: number; 
            autocapture: number 
          } 
        } = {};

        for (const result of data.results) {
          const { distinct_id: userId, event } = result;
          const eventName = event.replace('$', '');

          if (!['pageview', 'web_vitals', 'pageleave', 'autocapture'].includes(eventName)) {
            continue;
          }

          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const combinationID = userData.combinationID;
            const combinationName = userData.combinationName || combinationID;

            if (combinationID) {
              if (!newCombinationCounts[combinationID]) {
                newCombinationCounts[combinationID] = {
                  interactions: 0,
                  name: combinationName,
                  pageview: 0,
                  web_vitals: 0,
                  pageleave: 0,
                  autocapture: 0,
                };
              }

              if (eventName === 'pageview') {
                newCombinationCounts[combinationID].pageview++;
              } else if (eventName === 'web_vitals') {
                newCombinationCounts[combinationID].web_vitals++;
              } else if (eventName === 'pageleave') {
                newCombinationCounts[combinationID].pageleave++;
              } else if (eventName === 'autocapture') {
                newCombinationCounts[combinationID].autocapture++;
              }

              newCombinationCounts[combinationID].interactions =
                newCombinationCounts[combinationID].pageview +
                newCombinationCounts[combinationID].web_vitals +
                newCombinationCounts[combinationID].pageleave +
                newCombinationCounts[combinationID].autocapture;
            }
          }
        }

        console.log("newCombinationCounts", newCombinationCounts);
        setCombinationCounts(newCombinationCounts);

        setAnalytics((prevAnalytics) => {
          const updatedAnalytics = [...prevAnalytics];

          for (const [combinationID, data] of Object.entries(newCombinationCounts)) {
            const existingIndex = updatedAnalytics.findIndex(
              (item) => item.id === combinationID
            );

            if (existingIndex !== -1) {
              updatedAnalytics[existingIndex].interactions = data.interactions;
              updatedAnalytics[existingIndex].name = data.name;
            } else {
              updatedAnalytics.push({
                id: combinationID,
                name: data.name,
                interactions: data.interactions,
                Pageviews: data.pageview,
                Pageleaves: data.pageleave,
                AutoCapture: data.autocapture,
              });
            }
          }

          return updatedAnalytics;
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching PostHog data:", error);
        setLoading(false);
      }
    };

    const fetchDeveloperData = async () => {
      try {
        const developerDocRef = doc(db, "developer", "zjLHwJHVUHxNsyxFK0tX");
        const developerDocSnap = await getDoc(developerDocRef);
    
        if (!developerDocSnap.exists()) {
          throw new Error("Developer document does not exist");
        }
    
        const developerData = developerDocSnap.data();
        console.log("Developer Data:", developerData);
    
        const newKeysData: string[] = [];
    
        const keysCollectionRef = collection(db, "developer", "zjLHwJHVUHxNsyxFK0tX", "keys");
        const keysSnapshot = await getDocs(keysCollectionRef);
    
        keysSnapshot.forEach((doc) => {
          const keyID = doc.id;
          const keyData = doc.data();
    
          // If the document ID contains a '-', the key is stored in the document ID
          if (keyID.includes('-')) {
            newKeysData.push(keyID);
          } else if (keyData.key) {
            // Otherwise, the key is stored in the 'key' field
            newKeysData.push(keyData.key);
          }
        });
    
        console.log("Keys Data:", newKeysData);
        setKeysList(newKeysData);
        setTotalKeys(newKeysData.length);
      } catch (error) {
        console.error("Error fetching developer data:", error);
      }
    };
    
    fetchDeveloperData();
    fetchPosthogData();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <Navbar />
      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6">Combination Analytics</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
          </div>
        ) : (
          <>
            {/* Keys Block */}
            <div className="bg-zinc-900 p-4 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Total Keys: {totalKeys}</h2>
              <button
                onClick={toggleDropdown}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                {isDropdownOpen ? 'Hide Keys' : 'Show Keys'}
              </button>

              {isDropdownOpen && (
                <ul className="mt-4 bg-zinc-800 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {keysList.length > 0 ? (
                    keysList.map((key, index) => (
                      <li key={index} className="text-white mb-2">
                        {key}
                      </li>
                    ))
                  ) : (
                    <li className="text-white">No keys available</li>
                  )}
                </ul>
              )}
            </div>

            {/* Rest of the Analytics */}
            <div className="flex flex-row bg-zinc-900 rounded-lg shadow-md p-6 mb-6">
              <div className="w-1/2 pr-3">
                <h2 className="text-2xl font-bold mb-4">Interactions by Combination</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics}>
                    <XAxis dataKey="name" stroke="#ffffff" tick={false} />
                    <YAxis stroke="#ffffff" />
                    <Tooltip contentStyle={{ color: 'black' }} />
                    <Bar dataKey="interactions">
                      {analytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#8884d8" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-1/2 pl-3 flex flex-col justify-between">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Page Views Distribution</h2>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={analytics}
                        dataKey="Pageviews"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#82ca9d"
                        label
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Page Leaves Distribution</h2>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={analytics}
                        dataKey="Pageleaves"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        label
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg shadow-md p-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-800">
                    <TableHead className="text-zinc-300">Combination Name</TableHead>
                    <TableHead className="text-zinc-300">Interactions</TableHead>
                    <TableHead className="text-zinc-300">Pageviews</TableHead>
                    <TableHead className="text-zinc-300">Pageleaves</TableHead>
                    <TableHead className="text-zinc-300">Dynamic Element Hits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((component) => (
                    <TableRow key={component.id} className="border-b border-zinc-800">
                      <TableCell className="text-white">{component.name}</TableCell>
                      <TableCell className="text-white">{component.interactions}</TableCell>
                      <TableCell className="text-white">{component.Pageviews}</TableCell>
                      <TableCell className="text-white">{component.Pageleaves}</TableCell>
                      <TableCell className="text-white">{component.AutoCapture}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
