"use client";

import React from "react";
import { X } from "lucide-react";

interface Claim {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  place_of_birth: string;
  regiment: string;
  military_category: string;
  nara_film_no: string;
  roll_no: string;
  beginning_frame: string;
  former_slave_owner: string;
  owner_residence: string;
}

interface ClaimModalProps {
  claim: Claim | null;
  onClose: () => void;
}

const ClaimModal: React.FC<ClaimModalProps> = ({ claim, onClose }) => {
  if (!claim) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative rounded-2xl shadow-2xl border border-[var(--color-brand-green)] bg-[var(--color-brand-tan)] w-[90vw] max-w-md p-4 md:p-8 flex flex-col items-center">
        <div className="flex items-center justify-between mb-4 w-full">
          <span className="text-lg font-serif text-[var(--color-brand-brown)]">
            Claim Details
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-[var(--color-brand-tan)] transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="w-full text-left">
          <h3 className="text-xl font-semibold">{`${claim.first_name} ${claim.last_name}`}</h3>
          <p className="text-gray-600">Age: {claim.age}</p>
          <p className="text-gray-600">
            Place of Birth: {claim.place_of_birth}
          </p>
          <p className="text-gray-600">Regiment: {claim.regiment}</p>
          <p className="text-gray-600">
            Military Category: {claim.military_category}
          </p>
          <p className="text-gray-600">NARA Film No: {claim.nara_film_no}</p>
          <p className="text-gray-600">Roll No: {claim.roll_no}</p>
          <p className="text-gray-600">
            Beginning Frame: {claim.beginning_frame}
          </p>
          <p className="text-gray-600">
            Former Slave Owner: {claim.former_slave_owner}
          </p>
          <p className="text-gray-600">
            Owner Residence: {claim.owner_residence}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimModal;
