import React, { useState, useEffect } from 'react';
import CartUI from '../components/CartUI';
import { useAuth } from '../components/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { useCart } from '../context/cartContext';

import config from '../config/config';
import state from '../store';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from '../components';

const Customizer = () => {
  const snap = useSnapshot(state);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(500);
  const basePrice = 500;

  const { addToCart, cartItems } = useCart();
  const { logout } = useAuth(); // ✅ Use logout function directly here

  useEffect(() => {
    let sizeMultiplier = 1;
    switch (selectedSize) {
      case 'S': sizeMultiplier = 0.9; break;
      case 'M': sizeMultiplier = 1; break;
      case 'L': sizeMultiplier = 1.1; break;
      case 'XL': sizeMultiplier = 1.2; break;
    }
    const calculatedPrice = Math.round(basePrice * sizeMultiplier * quantity);
    setPrice(calculatedPrice);
  }, [selectedSize, quantity]);

  const [file, setFile] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  });
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
  const [addressForm, setAddressForm] = useState({
  pincode: '', city: '', district: '', state: '',
  detailedAddress: '', houseNo: '', street: '', landmark: '',
  mobile: '', isMobileVerified: false,
  age: '', gender: ''
});

  const handleAddToCart = () => {
    const shirtItem = {
      id: `custom-${Date.now()}`,
      name: 'Custom Shirt',
      color: state.color || 'default',
      size: selectedSize,
      price,
      quantity,
    };
    addToCart(shirtItem);
    setIsAddressFormVisible(true);
    setIsCartVisible(true);
  };

  const handleCloseCart = () => setIsCartVisible(false);

  const handleConfirmPayment = () => {
    alert('Order confirmed! Thank you for your purchase.');
    setIsCartVisible(false);
  };

  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colorpicker': return <ColorPicker />;
      case 'filepicker': return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case 'aipicker': return <AIPicker prompt={prompt} setPrompt={setPrompt} generatingImg={generatingImg} handleSubmit={handleSubmit} />;
      default: return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter a prompt");
    try {
      setGeneratingImg(true);
      const response = await fetch('https://devswag.onrender.com/api/v1/dalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      handleDecals(type, `data:image/png;base64,${data.photo}`);
    } catch (error) {
      alert(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];
    state[decalType.stateProperty] = result;
    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    if (tabName === 'logoShirt') {
      state.isLogoTexture = !activeFilterTab[tabName];
    } else if (tabName === 'stylishShirt') {
      state.isFullTexture = !activeFilterTab[tabName];
    }
    setActiveFilterTab((prevState) => ({
      ...prevState,
      [tabName]: !prevState[tabName]
    }));
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab("");
    });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          {/* Left Panel */}
          <motion.div className="absolute top-0 left-0 z-10" {...slideAnimation('left')}>
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab key={tab.name} tab={tab} handleClick={() => setActiveEditorTab(tab.name)} />
                ))}
                {generateTabContent()}

                {/* Size, Quantity, Price */}
                <div className="p-4 space-y-4 bg-white rounded-lg shadow-md mt-4">
                  <div>
                    <label className="block text-sm font-medium">Select Size:</label>
                    <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="mt-1 p-2 border rounded w-full">
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Quantity:</label>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="mt-1 p-2 border rounded w-full" />
                  </div>

                  <div>
                    <p className="text-md font-semibold">Total Price: ₹{price}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Buttons on Right */}
          <motion.div className="absolute z-10 top-5 right-5" {...fadeAnimation}>
            <CustomButton type="filled" title="Go Back" handleClick={() => (state.intro = true)} customStyles="w-fit px-4 py-2.5 font-bold text-sm" />
          </motion.div>

          <motion.div className="absolute z-10 top-20 right-5" {...fadeAnimation}>
            <CustomButton type="filled" title="Add to cart" handleClick={handleAddToCart} customStyles="w-fit px-4 py-2.5 font-bold text-sm" />
          </motion.div>

          <motion.div className="absolute z-10 top-36 right-5" {...fadeAnimation}>
            <CustomButton type="filled" title="Download" handleClick={downloadCanvasToImage} customStyles="w-fit px-4 py-2.5 font-bold text-sm" />
          </motion.div>

          <motion.div className="absolute z-10 top-52 right-5" {...fadeAnimation}>
            <CustomButton type="filled" title="Log Out" handleClick={logout} customStyles="w-fit px-4 py-2.5 font-bold text-sm" />
          </motion.div>

          {/* Filter Tabs */}
          <motion.div className="filtertabs-container" {...slideAnimation("up")}>
            {FilterTabs.map((tab) => (
              <Tab key={tab.name} tab={tab} isFilterTab isActiveTab={activeFilterTab[tab.name]} handleClick={() => handleActiveFilterTab(tab.name)} />
            ))}
          </motion.div>

          {/* Cart UI */}
          {isCartVisible && (
            <CartUI cartItems={cartItems} onClose={handleCloseCart} onConfirmPayment={handleConfirmPayment} />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
