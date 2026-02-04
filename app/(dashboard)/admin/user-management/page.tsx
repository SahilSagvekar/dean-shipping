'use client'

import { useState } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import imgLogo from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import imgUserManagementIcon from "@/app/assets/a961317a5944ebd34013fff0b9659f00f55e3f7c.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";

const usersData = [
  {
    id: 1,
    name: "Chris Kenobi",
    email: "chriskenobi@demo.com",
    phone: "+1 1234 1234",
    address: "ABC-12, ABC DEF, BD-12",
  },
  {
    id: 2,
    name: "Jane Forbes",
    email: "janeforbes@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 3,
    name: "George Davidson",
    email: "georgedavidson@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 4,
    name: "Julian Vance",
    email: "julianvance@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 5,
    name: "Elena Mendoza",
    email: "elenamendoza@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 6,
    name: "Silas Davidson",
    email: "silasdavidson@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 7,
    name: "Clara Whitlock",
    email: "clarawhitlock@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 8,
    name: "Naomi Rivers",
    email: "naomi@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 9,
    name: "George Davidson",
    email: "georgedavidson@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 10,
    name: "Julian Vance",
    email: "julianvance@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 11,
    name: "Caleb Sinclair",
    email: "calebsinclair@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 12,
    name: "Zoe Kensington",
    email: "zoedemo112@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 13,
    name: "Gideon Blackwood",
    email: "gideonb001@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 14,
    name: "Isla Sterling",
    email: "islasterling@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
  {
    id: 15,
    name: "Felix Montague",
    email: "felixm001@demo.com",
    phone: "+1 1234 1234",
    address: "",
  },
];

export default function UserManagement() {
  const [expandedUser, setExpandedUser] = useState<
    number | null
  >(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = usersData.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const toggleUser = (id: number) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header handled by (dashboard)/layout.tsx */}


      {/* User Management Icons */}
      <div className="flex justify-center mb-12">
        <img
          src={imgUserManagementIcon.src}
          alt="User Management"
          className="h-[200px] w-auto"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-8 flex-1">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[40px] font-medium text-[#296341] mb-2">
            USER MANAGEMENT
          </h1>
          <div className="h-[5px] bg-[#296341] rounded-full w-[202px]" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 text-black" />
          <input
            type="text"
            placeholder="Search user name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded pl-14 pr-4 py-3 text-[20px]"
          />
        </div>

        {/* Users List */}
        <div className="border border-[#296341]">
          {filteredUsers.map((user, index) => (
            <div key={user.id}>
              <div
                className={`${expandedUser === user.id
                    ? "border-[#296341] min-h-[250px]"
                    : "h-[65px]"
                  } border-b border-[#296341] relative`}
              >
                {/* User Row */}
                <div className="flex items-center px-8 py-4 h-[65px]">
                  <div className="w-[50px] text-[28px]">
                    {index + 1}.
                  </div>
                  <div className="w-[280px] text-[28px]">
                    {user.name}
                  </div>
                  <div className="w-[380px] text-[28px]">
                    {user.email}
                  </div>
                  <div className="w-[250px] text-[28px]">
                    {user.phone}
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => toggleUser(user.id)}
                    className="p-2 hover:bg-gray-100 rounded mr-4"
                  >
                    {expandedUser === user.id ? (
                      <ChevronUp className="w-9 h-9 text-[#296341]" />
                    ) : (
                      <ChevronDown className="w-9 h-9 text-[#296341]" />
                    )}
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Trash2 className="w-10 h-10 text-[#296341]" />
                  </button>
                </div>

                {/* Expanded Content */}
                {expandedUser === user.id && (
                  <div className="px-8 pb-6 pt-2">
                    <div className="flex items-start gap-6">
                      {/* Large ID Card */}
                      <div className="border border-[#296341] rounded-[10px] overflow-hidden">
                        <img
                          src={imgIdCard.src}
                          alt="ID Card"
                          className="w-[272px] h-[142px] object-cover"
                        />
                      </div>

                      {/* Small ID Cards */}
                      <div className="flex flex-col gap-2">
                        <div className="border border-[#296341] rounded-[10px] overflow-hidden">
                          <img
                            src={imgIdCard.src}
                            alt="ID Card"
                            className="w-[92px] h-[64px] object-cover"
                          />
                        </div>
                        <div className="border border-[#296341] rounded-[10px] overflow-hidden">
                          <img
                            src={imgIdCard.src}
                            alt="ID Card"
                            className="w-[92px] h-[64px] object-cover"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center h-[142px]">
                        <p className="text-[28px]">
                          {user.address ||
                            "No address available"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-[20px] text-[#3b3b3b]">
            Showing {filteredUsers.length} of 604 users
          </p>
          <button className="border border-[#296341] rounded-[10px] px-6 py-2 text-[20px] text-[#296341] hover:bg-gray-50">
            View all Shipments →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={imgLogo.src}
              alt="Dean's Shipping Ltd"
              className="h-[94px]"
            />
          </div>
          <div className="text-white text-[40px] font-semibold">
            Administration |{" "}
            <span className="font-normal">Cicily Dean</span>
          </div>
        </div>
      </footer>
    </div>
  );
}