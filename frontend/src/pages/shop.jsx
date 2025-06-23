import React, { useRef } from 'react'
import Hero from "../components/Hero/Hero";
import Popular from '../components/Popular/Popular';
import Offers from '../components/Offers/Offers';
import NewCollections from '../components/NewCollections/NewCollections';
import NewsLetter from '../components/NewsLetter/NewsLetter';

const Shop = () => {
  // Add ref for scrolling
  const newCollectionRef = useRef(null);

  return (
    <div>
      <Hero />
      <Popular />
      <Offers />
      <div id="new-collection" ref={newCollectionRef}>
        <NewCollections />
      </div>
      <NewsLetter />
    </div>
  );
};



export default Shop