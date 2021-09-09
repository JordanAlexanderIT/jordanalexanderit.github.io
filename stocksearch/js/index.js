const url = new URL(window.location.href);
const compSymbol = url.searchParams.get("search");
// console.log(compSymbol);

let autoFetch;
// console.log(autoFetch);

const loader = document.getElementById("loader");
// To add the css-loading-indicator along with a timeout failsafe.
function displayLoading() {
  loader.classList.add("loader");
  // to stop it after a set amount of time
  setTimeout(() => {
    loader.classList.remove("loader");
  }, 5000);
}
//Hiding the loader after the result function
function hideLoading() {
  loader.classList.remove("loader");
}

const stockSearch = async (newStockCode) => {
  try {
    const searchQuery = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=${newStockCode}&limit=10&exchange=NASDAQ`;
    displayLoading();
    /* New functionality, take the stock code and append it to the current url without a page reload occuring
    'url' was created above at the top of the page to be used again here as a reference */
    url.searchParams.set("search", newStockCode);
    window.history.pushState({}, "", url);

    const response = await fetch(searchQuery);
    const data = await response.json();
    hideLoading();
    for (let i = 0; i < data.length; i++) {
      // Create div & a elements
      let divContainer = document.createElement("div");
      let anchor = document.createElement("a");
      let changeSpan = document.createElement("span");
      let compImage = document.createElement("img");
      let compareButton = document.createElement("button");
      // Give the div the items class, and apend the a tag to be its child
      divContainer.classList.add("items");
      divContainer.id = `item-${data[i].symbol}`;
      divContainer.appendChild(anchor);
      divContainer.appendChild(compareButton);
      compareButton.innerText = `Compare`;
      compareButton.classList.add("compare-button");

      // Set the inner html of the a tag to the name & symbol of the company
      anchor.innerText = `${data[i].name} (${data[i].symbol})`;
      // Set the redirect to company's page
      anchor.href = `./company.html?symbol=${data[i].symbol}`;

      // RegExp magic, $& returns the matched string segment

      let re = RegExp(newStockCode, "gi");
      let str = anchor.innerText;
      let newstr = str.replace(re, `<mark>$&</mark>`);
      // console.log(newstr);
      anchor.innerHTML = newstr;
      container.appendChild(divContainer);
      compareArray = [];
      startCompareButton.innerText = `Compare Stocks by selecting up to three Companies`;
      compareButton.onclick = function () {
        if (compareArray.length < 3) {
          if (compareArray.length === 0) {
            startCompareButton.innerText = `Compare ${
              compareArray.length + 1
            } Company`;
          } else {
            startCompareButton.innerText = `Compare ${
              compareArray.length + 1
            } Companies`;
          }
          let compEntry = document.createElement("button");
          compEntry.classList.add("comp-entry-button");
          compEntry.id = `${data[i].symbol}`;
          compareList.append(compEntry);
          compEntry.innerHTML = `${data[i].symbol} &#10006;`;
          compareArray.push(data[i].symbol);
          compEntry.onclick = function () {
            if (compareArray.length === 2) {
              startCompareButton.innerText = `Compare ${
                compareArray.length - 1
              } Company`;
            } else {
              startCompareButton.innerText = `Compare ${
                compareArray.length - 1
              } Companies`;
            }
            compEntry.remove();
            compareArray.pop([i]);
          };
        }
      };
      const companySearch = async () => {
        try {
          let companyUrl = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${data[i].symbol}`;
          const companyResponse = await fetch(companyUrl);
          const companyData = await companyResponse.json();
          let compPic = companyData.profile.image;
          let changes = companyData.profile.changes.toFixed(2);
          anchor.prepend(compImage);
          compImage.src = compPic;
          // If the image doesn't exist, load this placeholder instead
          compImage.onerror = function () {
            compImage.src = "./img/mee6.png";
            // console.log("failure");
          };
          if (changes > 0) {
            anchor.appendChild(changeSpan);
            // Add it to the innerhtml of the a tag
            changeSpan.innerHTML += ` (${changes}%)`;
            changeSpan.classList.add("positive-change");
          } else if (changes < 0) {
            anchor.appendChild(changeSpan);
            changeSpan.innerHTML += ` (${changes}%)`;
            changeSpan.classList.add("negative-change");
          } else {
            anchor.appendChild(changeSpan);
            changeSpan.innerHTML += ` (${changes}%)`;
          }
          startCompareButton.onclick = function () {
            // Check to see if at least two companies are in the compare-box
            if (compareArray.length <= 1) {
              alert("Please select at least two companies to compare");
            } else {
              // window.location.href = `./compare.html?symbol=${compareArray[0]},${compareArray[1]},${compareArray[2]}`;
              window
                .open(
                  `./compare.html?symbol=${compareArray[0]},${compareArray[1]},${compareArray[2]}`,
                  "_blank"
                )
                .focus();
            }
          };
        } catch (err) {
          console.log(err);
          console.log("A companyData profile is missing");
          compImage.src = "./img/mee6.png";
          anchor.prepend(compImage);
          changeSpan.innerText = "(N/A)";
          changeSpan.classList.add("negative-change");
          anchor.append(changeSpan);
        }
      };
      companySearch();
    }
  } catch (err) {
    console.log(err);
    console.log("Error inside data for search");
  }
};

const container = document.getElementById("result-list");
const stockTicker = document.getElementById("ticker");
const compareList = document.getElementById("compareList");
const startCompareButton = document.getElementById("startCompare");
const loadTicker = async () => {
  const tickerUrl = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/quotes/nasdaq`;
  const tickerResponse = await fetch(tickerUrl);
  const tickerData = await tickerResponse.json();
  for (let i = 0; i < 100; i++) {
    // console.log(tickerData[i]);
    let tickerItem = document.createElement("div");
    let tickerItemPrice = document.createElement("span");
    tickerItemPrice.classList.add("ticker-item-price");
    tickerItem.classList.add("ticker-item");
    tickerItem.innerHTML = `${tickerData[i].symbol}`;
    tickerItemPrice.innerHTML = `$${tickerData[i].price.toFixed(2)}`;
    stockTicker.append(tickerItem);
    tickerItem.append(tickerItemPrice);
  }
};

if (compSymbol) {
  // console.log("Oh hey I can do a fetch call");
  autoFetch = true;
  newStockCode = compSymbol;
  stockSearch(newStockCode);
} else {
  // console.log("We're empty! Wait for user input");
  autoFetch = false;
}

loadTicker();
searchtimer = () => (clear = true);
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("stock-search").addEventListener("input", (evt) => {
    clearTimeout(searchtimer);
    searchtimer = setTimeout(() => {
      // This line clears the results from the previous search.
      container.innerHTML = "";
      // This line grabs the text from the user input to begin searching for stocks.
      let newStockCode = evt.target.value;
      stockSearch(newStockCode);
      clearTimeout(searchtimer);
    }, 750);
  });
});

// Example of a fetch call with .then():
// const urlVariable = `whatever${someDynamicValueFromAbove}`;
// fetch(urlVariable)
//   .then((whateverResponse) => whateverResponse.json())
//   .then((newData) => {
//     for (let i = 0; i < newData.length; i++) {}
//   });

// Example of an async-await fetch (my new favorite!)
// const functionName = async () => {
//   const urlVariable = `whatever${someDynamicValueFromAbove}`;
//   const response = await fetch(urlVariable);
//   const data = await response.json();

// };
// functionName();
