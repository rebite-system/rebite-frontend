import { useState, useEffect } from "react";
import mockUser from "../data/mockUser";

function useListings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("listings") || "[]");
    const combined = [...saved, ...mockUser.listings];
    setListings(combined);
  }, []);

  function addListing(newListing) {
    const saved = JSON.parse(localStorage.getItem("listings") || "[]");
    const updated = [newListing, ...saved];
    localStorage.setItem("listings", JSON.stringify(updated));
    setListings([...updated, ...mockUser.listings]);
  }

  function editListing(id, updatedData) {
    const saved = JSON.parse(localStorage.getItem("listings") || "[]");
    const updatedSaved = saved.map((l) =>
      l.id === id ? { ...l, ...updatedData } : l
    );
    localStorage.setItem("listings", JSON.stringify(updatedSaved));
    setListings([...updatedSaved, ...mockUser.listings]);
  }

  function deleteListing(id) {
    const saved = JSON.parse(localStorage.getItem("listings") || "[]");
    const updatedSaved = saved.filter((l) => l.id !== id);
    localStorage.setItem("listings", JSON.stringify(updatedSaved));
    setListings([...updatedSaved, ...mockUser.listings]);
  }

  return { listings, addListing, editListing, deleteListing };
}

export default useListings;