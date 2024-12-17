document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = "https://meowmeow.ngrok.app"; // Adjust if needed
  
    let direction = "crypto_to_xmr"; 
    let selectedFromCurrency = null;
    let selectedToCurrency = "XMR";
  
    const defaultCrypto = "USDTBEP20";
  
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
  
    const fromWarningEl = document.getElementById('network-warning-from');
    const toWarningEl = document.getElementById('network-warning-to');
  
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
  
    function renderCryptoButton(buttonEl, symbol, image, network) {
      buttonEl.innerHTML = ''; 
      buttonEl.style.display = 'inline-flex';
      buttonEl.style.alignItems = 'center';
      buttonEl.style.padding = '5px';
      buttonEl.style.background = 'transparent';
      buttonEl.style.border = '1px solid #444';
      buttonEl.style.borderRadius = '4px';
  
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
  
      let coin = aggregatorCryptos.find(c => c.symbol === symbol);
      let displayName = symbol;
      if (coin && coin.name) {
        displayName = symbol + " - " + coin.name;
      }
  
      const symbolSpan = document.createElement('span');
      symbolSpan.style.fontWeight = 'bold';
      symbolSpan.style.fontSize = '14px';
      symbolSpan.textContent = displayName;
  
      const netKey = (coin.network || symbol).toUpperCase();
      const networkDiv = document.createElement('div');
      networkDiv.style.fontSize = '12px';
      networkDiv.style.color = '#fff';
      networkDiv.style.padding = '2px 4px';
      networkDiv.style.borderRadius = '4px';
      networkDiv.style.marginTop = '2px';
      networkDiv.style.display = 'inline-block';
      networkDiv.style.backgroundColor = networkColors[netKey] || '#444';
      networkDiv.textContent = coin.network ? coin.network.toUpperCase() : symbol;
  
      infoDiv.appendChild(symbolSpan);
      infoDiv.appendChild(networkDiv);
  
      buttonEl.appendChild(imgEl);
      buttonEl.appendChild(infoDiv);
    }
  
    function buildDropdownItems(dropdown, cryptos, onSelect) {
      const existingItems = dropdown.querySelectorAll('.dropdown-item');
      existingItems.forEach(i => i.remove());
  
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
  
        let displayName = coin.symbol;
        if (coin.name) displayName = coin.symbol + " - " + coin.name;
  
        const symbolSpan = document.createElement('span');
        symbolSpan.style.fontWeight = 'bold';
        symbolSpan.style.fontSize = '14px';
        symbolSpan.textContent = displayName;
  
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
  
    // Other existing code remains unchanged...
  });
  