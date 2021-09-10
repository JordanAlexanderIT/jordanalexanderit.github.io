// Using URL(window.location.href) converts the url itself into a URL object which allows me to run searchParams for the 'symbol' or anything else.
const url = new URL(window.location.href);
const compSymbol = url.searchParams.get("symbol");
// console.log(compSymbol);

const loader = document.getElementById("loader");
const loaderBox = document.getElementById("loaderBox");
// const chartBoxLoader = document.getElementById("chartLoaderBox");
// const loaderChart = document.getElementById("loader-box-chart");
const compareResultsWrapper = document.getElementById("compareResultsWrapper");

// To add the loading-indicator along with a timeout failsafe.

function displayLoading() {
  loader.classList.add("loader");
  // to stop it after a set amount of time
  setTimeout(() => {
    loader.classList.remove("loader");
  }, 5000);
}

//Hiding the loader after

function hideLoading() {
  loader.remove();
  loaderBox.remove();
}

const multiCompare = async () => {
  try {
    const urlVariable = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${compSymbol}`;
    const stockHistoryUrl = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${compSymbol}?serietype=line`;
    displayLoading();
    const response = await fetch(urlVariable);
    const data = await response.json();
    hideLoading();
    const graphDataResponse = await fetch(stockHistoryUrl);
    const graphData = await graphDataResponse.json();
    for (i = 0; i < data.companyProfiles.length; i++) {
      if (data.companyProfiles.length < 4) {
        // Create a box for each company to compare
        resultColumn = document.createElement("div");
        compareResultsWrapper.append(resultColumn);
        resultColumn.classList.add("result-column");
        // Create the top-row for the box which contains the company image and name
        resultCompTopRow = document.createElement("div");
        resultColumn.append(resultCompTopRow);
        resultCompTopRow.classList.add("company-top-row-wrapper-compare");
        // Filling in the top row
        compImageContainer = document.createElement("div");
        compImage = document.createElement("img");
        compNameContainer = document.createElement("div");
        compName = document.createElement("h1");
        sectorSpan = document.createElement("span");
        resultCompTopRow.append(compImageContainer, compNameContainer);
        compNameContainer.classList.add("company-name-compare");
        compImageContainer.classList.add("company-image-compare");
        compImageContainer.append(compImage);
        compImage.src = data.companyProfiles[i].profile.image;
        // Assigning unique ids for each image for error-handling at the end
        compImage.id = `check-id-${[i]}`;
        // Why does this only affect the last box? Need the Scooby gang to solve this mystery I think..
        compImage.onerror = function () {
          compImage.src = `./img/mee6.png`;
        };
        compNameContainer.append(compName);
        compName.innerText = `${data.companyProfiles[i].profile.companyName}`;
        // Append the company's business sector if it exists
        if (data.companyProfiles[i].profile.sector) {
          compName.append(sectorSpan);
          sectorSpan.classList.add("sector-span");
          sectorSpan.innerText = `(${data.companyProfiles[i].profile.sector})`;
        }
        // Create the stock-price wrapper that goes below the top row
        stockPriceWrapper = document.createElement("div");
        curStockPrice = document.createElement("div");
        curStockPriceSpan = document.createElement("span");
        stockPriceChange = document.createElement("div");
        resultCompTopRow.append(stockPriceWrapper);
        stockPriceWrapper.classList.add("stock-price-wrapper");
        stockPriceWrapper.append(curStockPrice);
        curStockPrice.innerText = `Stock Price: `;
        curStockPrice.classList.add("current-stock-price");
        curStockPrice.append(curStockPriceSpan);
        curStockPriceSpan.innerText = `$${data.companyProfiles[
          i
        ].profile.price.toFixed(2)}`;
        stockPriceWrapper.append(stockPriceChange);
        priceChange = data.companyProfiles[i].profile.changes.toFixed(2);
        stockPriceChange.innerText = `(${priceChange}%)`;
        if (priceChange > 0) {
          stockPriceChange.classList.add("positive-change");
        } else if (priceChange < 0) {
          stockPriceChange.classList.add("negative-change");
        }
        stockPriceChange.classList.add("stock-price-change");
        // Create the company-description boxes
        compDescriptionContainer = document.createElement("div");
        compDescription = document.createElement("p");
        resultCompTopRow.append(compDescriptionContainer);
        compDescriptionContainer.classList.add("company-description-compare");
        compDescriptionContainer.append(compDescription);
        compDescription.innerText = `${data.companyProfiles[i].profile.description}`;
        // Create the website-links
        compLinkContainer = document.createElement("div");
        compLink = document.createElement("a");
        resultCompTopRow.append(compLinkContainer);
        compLinkContainer.classList.add("company-link");
        compLinkContainer.append(compLink);
        compLink.href = `${data.companyProfiles[i].profile.website}`;
        compLink.innerText = `Visit their website`;
        // Create the chart containers
        stockChart = document.createElement("div");
        stockChartCanvas = document.createElement("canvas");
        resultColumn.append(stockChart);
        stockChart.classList.add("stock-chart-compare");
        stockChart.append(stockChartCanvas);
        stockChartCanvas.classList.add("chart-itself");
        stockChartCanvas.id = `myChart-${[i]}`;
        // Create the arrays for up to three charts
        dateArrayOne = [];
        closePriceArrayOne = [];
        dateArrayTwo = [];
        closePriceArrayTwo = [];
        dateArrayThree = [];
        closePriceArrayThree = [];
        // Grab twenty days worth of stock data for each company and pass each into their own array for organization's sake.
        for (x = 0; x < 20; x++) {
          dateArrayOne.push(
            graphData.historicalStockList[0].historical[x].date
          );
          closePriceArrayOne.push(
            graphData.historicalStockList[0].historical[x].close
          );
          if (graphData.historicalStockList[1]) {
            dateArrayTwo.push(
              graphData.historicalStockList[1].historical[x].date
            );
            closePriceArrayTwo.push(
              graphData.historicalStockList[1].historical[x].close
            );
          }
          if (graphData.historicalStockList[2]) {
            dateArrayThree.push(
              graphData.historicalStockList[2].historical[x].date
            );
            closePriceArrayThree.push(
              graphData.historicalStockList[2].historical[x].close
            );
          }
        }
      } else {
        //   Do nothing for now
      }
    }
    // Reverse arrays to make graph data populate in the correct order
    // Create the charts (There must be a more elegant way of doing this with vanilla JS)
    const chaOne = document.getElementById(`myChart-0`);
    const myChartOne = new Chart(chaOne, {
      type: "line",
      data: {
        labels: dateArrayOne.reverse(),
        datasets: [
          {
            label: "Recent stock history",
            data: closePriceArrayOne.reverse(),
            borderWidth: 1,
            fill: true,
            backgroundColor: "#FF2F7B",
          },
        ],
      },
      options: {},
    });
    const chaTwo = document.getElementById(`myChart-1`);
    const myChartTwo = new Chart(chaTwo, {
      type: "line",
      data: {
        labels: dateArrayTwo.reverse(),
        datasets: [
          {
            label: "Recent stock history",
            data: closePriceArrayTwo.reverse(),
            borderWidth: 1,
            fill: true,
            backgroundColor: "#FF2F7B",
          },
        ],
      },
      options: {},
    });
    const chaThree = document.getElementById(`myChart-2`);
    const myChartThree = new Chart(chaThree, {
      type: "line",
      data: {
        labels: dateArrayThree.reverse(),
        datasets: [
          {
            label: "Recent stock history",
            data: closePriceArrayThree.reverse(),
            borderWidth: 1,
            fill: true,
            backgroundColor: "#FF2F7B",
          },
        ],
      },
      options: {},
    });
  } catch (err) {
    console.log(err);
    compareResultsWrapper.innerHTML = `<h1>You are trying to pass only one or more than three companies into the compare page. Please try again.</h1>`;
    // Error-handling
  }
  // Oddly, this is how I had to handle replacing the images for the first two companies on the left -- elsewise for reasons I don't understand it only replaced the last box's image
  let leftBoxTest = document.getElementById("check-id-0");
  let middleBoxTest = document.getElementById("check-id-1");
  if (leftBoxTest) {
    leftBoxTest.onerror = function () {
      leftBoxTest.src = `./img/mee6.png`;
    };
  }
  if (middleBoxTest) {
    middleBoxTest.onerror = function () {
      middleBoxTest.src = `./img/mee6.png`;
    };
  }
};
multiCompare();
