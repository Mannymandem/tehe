document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = "https://meowmeow.ngrok.app"; // Updated URL; // Adjust if needed

  // Direction and selection
  let direction = "crypto_to_xmr"; 
  let selectedFromCurrency = null;
  let selectedToCurrency = "XMR";

  // Default crypto for when choosing aggregator coin side
  const defaultCrypto = "USDTBEP20"; // Ensure aggregator has this symbol

  // Elements
  const fromAmountInput = document.getElementById('from-amount-input');
  const toAmountInput = document.getElementById('to-amount-input');

  const fromCurrencyButton = document.getElementById('from-currency-select-button');
  const toCurrencyButton = document.getElementById('to-currency-select-button');
  const fromCurrencyDropdown = document.getElementById('from-currency-dropdown');
  const toCurrencyDropdown = document.getElementById('to-currency-dropdown');
  const fromSearchInput = document.getElementById('from-currency-search');
  const toSearchInput = document.getElementById('to-currency-search');

  const switchButton = document.getElementById('switch-button');
  const exchangeButton = document.getElementById('exchange-button');
  const depositInfo = document.getElementById('deposit-info');
  const depositAddressDisplay = document.getElementById('deposit-address-display');
  const statusDisplay = document.getElementById('status-display');
  const qrcodeContainer = document.getElementById('qrcode');

  let aggregatorCryptos = [];
  let coingeckoMap = {};

  const networkColors = {
    "BITCOIN": "#F7931A",
    "ETH": "#3C3C3D",
    "BSC": "#F0B90B",
    "TRX": "#EC0623",
    "EOS": "#000000",
    "SOL": "#9932CC",
    "XRP": "#346AA9",
    "LTC": "#BFBBBB",
    "ADA": "#0033AD",
    "DOT": "#E6007A",
    "AVAX": "#E84142",
    "MATIC": "#8247E5",
    "FTM": "#1969FF",
    "XMR": "#FF6600",
    "ARB": "#28A0F0",
    "OP": "#FF0420",
    "CRO": "#002D74",
    "ATOM": "#2E3148",
    "XTZ": "#0E75C9",
    "ALGO": "#000000",
    "ZIL": "#49C1BF",
    "NEAR": "#000000",
    "BNB": "#F3BA2F",
    "DOGE": "#C2A633",
    "VET": "#15BDFF",
    "ETC": "#34FA99",
    "DASH": "#008CE7",
    "ZEC": "#F4B728",
    "FIL": "#0090FF",
    "XLM": "#08B5E5",
    "HBAR": "#3A3A3A",
    "KSM": "#000000",
    "FLOW": "#28D9A3",
    "ICP": "#29ABE2",
    "ONE": "#00AEEF",
    "QTUM": "#2C9CED",
    "KAVA": "#FF2D55",
    "XDC": "#F49800",
    "WAVES": "#0055FF",
    "BTG": "#EBA809",
    "BCH": "#8DC351"
  };

  // Helper to render a crypto button similar to dropdown-item style
  function renderCryptoButton(buttonEl, symbol, image, network) {
    buttonEl.innerHTML = ''; // clear
    buttonEl.style.display = 'inline-flex';
    buttonEl.style.alignItems = 'center';
    buttonEl.style.padding = '5px';
    buttonEl.style.background = 'transparent';
    buttonEl.style.border = '1px solid #444';
    buttonEl.style.borderRadius = '4px';

    // If no image provided, fallback
    let imgSrc = image && image.trim() !== '' ? image : coingeckoMap[symbol] || 'https://via.placeholder.com/24';

    const imgEl = document.createElement('img');
    imgEl.src = imgSrc;
    imgEl.alt = `${symbol} logo`;
    imgEl.style.width = '24px';
    imgEl.style.height = '24px';
    imgEl.style.marginRight = '8px';

    const infoDiv = document.createElement('div');
    infoDiv.style.display = 'flex';
    infoDiv.style.flexDirection = 'column';

    const symbolSpan = document.createElement('span');
    symbolSpan.style.fontWeight = 'bold';
    symbolSpan.style.fontSize = '14px';
    symbolSpan.textContent = symbol;

    const netKey = (network || symbol).toUpperCase();
    const networkDiv = document.createElement('div');
    networkDiv.style.fontSize = '12px';
    networkDiv.style.color = '#fff';
    networkDiv.style.padding = '2px 4px';
    networkDiv.style.borderRadius = '4px';
    networkDiv.style.marginTop = '2px';
    networkDiv.style.display = 'inline-block';
    networkDiv.style.backgroundColor = networkColors[netKey] || '#444';
    networkDiv.textContent = network ? network.toUpperCase() : symbol;

    infoDiv.appendChild(symbolSpan);
    infoDiv.appendChild(networkDiv);

    buttonEl.appendChild(imgEl);
    buttonEl.appendChild(infoDiv);
  }

  // Filter function for dropdown
  function setupSearch(searchInput, dropdown) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const items = dropdown.querySelectorAll('.dropdown-item');
      items.forEach(item => {
        const textContent = item.textContent.toLowerCase();
        item.style.display = textContent.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // Build dropdown items
  function buildDropdownItems(dropdown, cryptos, onSelect) {
    dropdown.innerHTML = '';
    cryptos.forEach(coin => {
      const itemEl = document.createElement('div');
      itemEl.classList.add('dropdown-item');
      itemEl.style.display = 'flex';
      itemEl.style.alignItems = 'center';
      itemEl.style.cursor = 'pointer';
      itemEl.style.padding = '5px';

      let imgSrc = coin.image && coin.image.trim() !== '' ? coin.image : (coingeckoMap[coin.symbol] || 'https://via.placeholder.com/24');

      const imgEl = document.createElement('img');
      imgEl.src = imgSrc;
      imgEl.alt = `${coin.symbol} logo`;
      imgEl.style.width = '24px';
      imgEl.style.height = '24px';
      imgEl.style.marginRight = '8px';

      const infoDiv = document.createElement('div');
      infoDiv.style.display = 'flex';
      infoDiv.style.flexDirection = 'column';

      const symbolSpan = document.createElement('span');
      symbolSpan.style.fontWeight = 'bold';
      symbolSpan.style.fontSize = '14px';
      symbolSpan.textContent = coin.symbol;

      const netKey = (coin.network || coin.symbol).toUpperCase();
      const networkDiv = document.createElement('div');
      networkDiv.style.fontSize = '12px';
      networkDiv.style.color = '#fff';
      networkDiv.style.padding = '2px 4px';
      networkDiv.style.borderRadius = '4px';
      networkDiv.style.marginTop = '2px';
      networkDiv.style.display = 'inline-block';
      networkDiv.style.backgroundColor = networkColors[netKey] || '#444';
      networkDiv.textContent = coin.network ? coin.network.toUpperCase() : coin.symbol;

      infoDiv.appendChild(symbolSpan);
      infoDiv.appendChild(networkDiv);

      itemEl.appendChild(imgEl);
      itemEl.appendChild(infoDiv);

      itemEl.addEventListener('click', () => {
        onSelect(coin);
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(itemEl);
    });
  }

  // Update UI after direction change or currency selection
  function updateUIAfterDirectionChange() {
    // If direction = crypto_to_xmr: user selects fromCurrency, to = XMR
    // If direction = xmr_to_crypto: from = XMR fixed, user selects toCurrency

    if (direction === "crypto_to_xmr") {
      // from = aggregator coin (selectedFromCurrency)
      // to = XMR
      let fromCoin = aggregatorCryptos.find(c => c.symbol === selectedFromCurrency);
      if (!fromCoin) {
        // fallback to default
        selectedFromCurrency = defaultCrypto;
        fromCoin = aggregatorCryptos.find(c => c.symbol === defaultCrypto);
      }
      renderCryptoButton(fromCurrencyButton, fromCoin.symbol, fromCoin.image, fromCoin.network);

      let xmrCoin = aggregatorCryptos.find(c => c.symbol === "XMR");
      // If no XMR in aggregator (unlikely), fallback
      if (!xmrCoin) xmrCoin = {symbol:"XMR", image:"", network:"xmr"};
      renderCryptoButton(toCurrencyButton, xmrCoin.symbol, xmrCoin.image, xmrCoin.network);

      // In this direction, to-currency is fixed XMR, disable toCurrencyButton click
      toCurrencyButton.style.pointerEvents = 'none';
      fromCurrencyButton.style.pointerEvents = 'auto';
    } else {
      // xmr_to_crypto: from = XMR fixed, to = aggregator coin
      let xmrCoin = aggregatorCryptos.find(c => c.symbol === "XMR");
      if (!xmrCoin) xmrCoin = {symbol:"XMR", image:"", network:"xmr"};
      renderCryptoButton(fromCurrencyButton, xmrCoin.symbol, xmrCoin.image, xmrCoin.network);

      let toCoin = aggregatorCryptos.find(c => c.symbol === selectedToCurrency);
      if (!toCoin) {
        selectedToCurrency = defaultCrypto;
        toCoin = aggregatorCryptos.find(c => c.symbol === defaultCrypto);
      }
      renderCryptoButton(toCurrencyButton, toCoin.symbol, toCoin.image, toCoin.network);

      // In this direction, from is XMR fixed, disable fromCurrencyButton, enable toCurrencyButton
      fromCurrencyButton.style.pointerEvents = 'none';
      toCurrencyButton.style.pointerEvents = 'auto';
    }
  }

  function updateAmounts() {
    const fromAmount = parseFloat(fromAmountInput.value);
    if (!fromAmount) {
      toAmountInput.value = "--";
      return;
    }

    let fromCur, toCur;
    if (direction === "crypto_to_xmr") {
      fromCur = selectedFromCurrency;
      toCur = "xmr";
    } else {
      fromCur = "xmr";
      toCur = selectedToCurrency;
    }

    if (!fromCur || !toCur) {
      toAmountInput.value = "--";
      return;
    }

    fetch(`${BACKEND_URL}/api/exchange-estimate?from_currency=${fromCur}&from_amount=${fromAmount}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toAmountInput.value = `Error: ${data.error}`;
          return;
        }
        // Update the to-amount-input
        toAmountInput.value = data.to_amount.toFixed(6);
      })
      .catch(err => {
        console.error("Error fetching estimate:", err);
        toAmountInput.value = "Error";
      });
  }

  exchangeButton.addEventListener('click', () => {
    const fromAmount = parseFloat(fromAmountInput.value);
    if (!fromAmount) {
      alert("Please enter an amount first.");
      return;
    }

    let fromCur, toCur;
    if (direction === "crypto_to_xmr") {
      fromCur = selectedFromCurrency;
      toCur = "xmr";
      if (!fromCur) {
        alert("Please select a crypto first.");
        return;
      }
    } else {
      fromCur = "xmr";
      toCur = selectedToCurrency;
      if (!toCur) {
        alert("Please select a crypto first.");
        return;
      }
    }

    const address = prompt(`Enter the recipient's ${toCur.toUpperCase()} address:`);
    if (!address) {
      alert(`${toCur.toUpperCase()} address is required.`);
      return;
    }

    const refundAddress = prompt(`Enter refund address for ${fromCur.toUpperCase()}:`) || "";

    const payload = {
      from_currency: fromCur,
      from_amount: fromAmount,
      address_to: address,
      user_refund_address: refundAddress
    };

    fetch(`${BACKEND_URL}/api/create-exchange`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Error creating exchange: " + data.error);
        return;
      }

      depositAddressDisplay.textContent = `Deposit this amount to: ${data.deposit_address}`;
      depositInfo.style.display = 'block';

      qrcodeContainer.innerHTML = "";
      new QRCode(qrcodeContainer, {
        text: data.deposit_address,
        width:128,
        height:128
      });

      pollTransactionStatus(data.transactionId);
    })
    .catch(err => {
      console.error("Error creating exchange:", err);
      alert("Failed to create exchange.");
    });
  });

  function pollTransactionStatus(txId) {
    const interval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/status/${txId}`)
        .then(res => res.json())
        .then(statusData => {
          if (statusData.error) {
            statusDisplay.textContent = `Error: ${statusData.error}`;
            clearInterval(interval);
            return;
          }

          statusDisplay.textContent = `Status: ${statusData.status}`;
          if (statusData.status === 'finished' || statusData.status === 'failed') {
            clearInterval(interval);
          }
        })
        .catch(err => {
          console.error("Error polling status:", err);
          clearInterval(interval);
        });
    }, 5000);
  }

  // Switch direction logic
  switchButton.addEventListener('click', () => {
    direction = (direction === "crypto_to_xmr") ? "xmr_to_crypto" : "crypto_to_xmr";
    // When switching direction:
    // If now xmr_to_crypto and no selectedToCurrency, set default
    if (direction === "xmr_to_crypto" && !selectedToCurrency) {
      selectedToCurrency = defaultCrypto;
    }
    if (direction === "crypto_to_xmr" && !selectedFromCurrency) {
      selectedFromCurrency = defaultCrypto;
    }
    updateUIAfterDirectionChange();
    updateAmounts();
  });

  // Show/hide dropdowns based on button click
  fromCurrencyButton.addEventListener('click', () => {
    if (direction === "crypto_to_xmr") {
      // User picks FROM crypto
      fromCurrencyDropdown.style.display = (fromCurrencyDropdown.style.display === 'block') ? 'none' : 'block';
    }
    // if direction = xmr_to_crypto, from is XMR fixed, do nothing
  });

  toCurrencyButton.addEventListener('click', () => {
    if (direction === "xmr_to_crypto") {
      // User picks TO crypto
      toCurrencyDropdown.style.display = (toCurrencyDropdown.style.display === 'block') ? 'none' : 'block';
    }
    // if direction = crypto_to_xmr, to is XMR fixed, do nothing
  });

  // Setup searching in dropdowns
  setupSearch(fromSearchInput, fromCurrencyDropdown);
  setupSearch(toSearchInput, toCurrencyDropdown);

  // After fetching cryptos, we will build both dropdowns
  function initializeDropdowns() {
    // Build fromCurrencyDropdown
    buildDropdownItems(fromCurrencyDropdown, aggregatorCryptos, (coin) => {
      // User selected from coin (direction=crypto_to_xmr)
      selectedFromCurrency = coin.symbol;
      updateUIAfterDirectionChange();
      updateAmounts();
    });

    // Build toCurrencyDropdown
    buildDropdownItems(toCurrencyDropdown, aggregatorCryptos, (coin) => {
      // User selected to coin (direction=xmr_to_crypto)
      selectedToCurrency = coin.symbol;
      updateUIAfterDirectionChange();
      updateAmounts();
    });
  }

  // Refresh estimate every 15 seconds
  setInterval(() => {
    const fromAmount = parseFloat(fromAmountInput.value);
    if (!fromAmount) return;
    if ( (direction === "crypto_to_xmr" && selectedFromCurrency) || (direction === "xmr_to_crypto" && selectedToCurrency) ) {
      updateAmounts();
    }
  }, 15000);


  // Fetch aggregator cryptos and coingecko logos first
  fetch(`${BACKEND_URL}/api/all_cryptos`)
    .then(res => res.json())
    .then(cryptos => {
      aggregatorCryptos = cryptos;
      return fetch(`${BACKEND_URL}/api/cryptos`);
    })
    .then(res => res.json())
    .then(geckoData => {
      geckoData.forEach(g => {
        const ticker = g.ticker.toUpperCase();
        coingeckoMap[ticker] = g.logo; 
      });

      // On first load:
      // direction=crypto_to_xmr, from=USDTBEP20, to=XMR
      selectedFromCurrency = defaultCrypto; 
      selectedToCurrency = "XMR";
      fromAmountInput.value = 100;

      initializeDropdowns();
      updateUIAfterDirectionChange();
      updateAmounts();
    })
    .catch(err => console.error("Error fetching cryptos:", err));

    fetch(`${BACKEND_URL}/api/all_cryptos`)
  .then(res => res.text())  // Read the response as text to debug
  .then(text => {
    console.log("Raw response text:", text);
    return JSON.parse(text);  // Attempt to parse JSON
  })
  .then(cryptos => {
    console.log("Parsed cryptos:", cryptos);
  })
  .catch(err => console.error("Error fetching cryptos:", err));

  fetch(`${BACKEND_URL}/api/all_cryptos`)
  .then(res => res.text()) // Capture the response as text
  .then(data => {
    console.log("Raw response:", data); // Log the raw response to the console
    return JSON.parse(data);            // Try parsing it as JSON
  })
  .then(cryptos => {
    console.log("Parsed cryptos:", cryptos); // Log parsed JSON if successful
  })
  .catch(err => console.error("Error fetching cryptos:", err));



});
