const url_string = window.location.href;
// Using URL(url_string) converts the url itself into a URL object which allows me to run searchParams for the 'symbol' or anything else.
const url = new URL(url_string);
const compSymbol = url.searchParams.get("symbol");

// These elements will temporarily hold the css-based loading indicator

const loader = document.getElementById("loader");
const loaderBox = document.getElementById("loaderBox");
const chartBoxLoader = document.getElementById("chartLoaderBox");
const loaderChart = document.getElementById("loader-box-chart");

// To add the loading-indicator along with a timeout failsafe.

function displayLoading() {
  loader.classList.add("loader");
  // to stop it after a set amount of time
  setTimeout(() => {
    loader.classList.remove("loader");
  }, 5000);
}

// I feel stupid creating duplicates of my functions for each loader, there must be a better way

function displayLoadingForChart() {
  loaderChart.classList.add("loader");
  // to stop it after a set amount of time
  setTimeout(() => {
    loaderChart.classList.remove("loader");
  }, 5000);
}

//Hiding the loader after

function hideLoading() {
  loader.classList.remove("loader");
  loaderBox.classList.add("hideme");
}

function hideLoadingForChart() {
  loaderChart.classList.remove("loader");
  chartBoxLoader.classList.add("hideme");
}

const fetchCompanyProfile = async () => {
  try {
    const imgContainer = document.getElementById("company-image");
    const compNameContainer = document.getElementById("company-name");
    const descriptionContainer = document.getElementById("company-description");
    const compLinkContainer = document.getElementById("company-link");
    const stockPriceContainer = document.getElementById("current-stock-price");
    const priceChangeContainer = document.getElementById("stock-price-change");
    const fetchUrl = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${compSymbol}`;
    displayLoading();
    const response = await fetch(fetchUrl);
    const gillyData = await response.json();
    hideLoading();
    let compImage = document.createElement("img");
    let compDescription = document.createElement("p");
    let compName = document.createElement("h1");
    if (Object.keys.gillyData === 0) {
      compImage.src = "./img/mee6.png";
      imgContainer.append(compImage);
      compName.textContent = `N/A - (${compSymbol})`;
      compNameContainer.append(compName);
      compDescription.textContent = "Company profile data is unavailable";
      descriptionContainer.append(compDescription);
      stockPriceContainer.innerText = "N/A";
    } else {
      if (gillyData.profile.changes > 0) {
        priceChangeContainer.classList.add("positive-change");
      } else if (gillyData.profile.changes < 0) {
        priceChangeContainer.classList.add("negative-change");
      } else {
        // Do nothing
      }
      compName.textContent = gillyData.profile.companyName;
      compDescription.textContent = gillyData.profile.description;
      compImage.src = gillyData.profile.image;
      compImage.onerror = function () {
        compImage.src = "./img/mee6.png";
      };
      imgContainer.append(compImage);
      compNameContainer.append(compName);
      descriptionContainer.append(compDescription);
      stockPriceContainer.textContent = `$ ${gillyData.profile.price.toFixed(
        2
      )}`;
      priceChangeContainer.textContent = `(${gillyData.profile.changes.toFixed(
        2
      )}%)`;
      compLinkContainer.innerHTML = `<a href="${gillyData.profile.website}">Visit their website</a>`;
    }
  } catch (err) {
    console.log(err);
  }
};
fetchCompanyProfile();

const stockHistoryFetch = async () => {
  try {
    const stockHistoryUrl = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${compSymbol}?serietype=line`;
    displayLoadingForChart();
    const stockResponse = await fetch(stockHistoryUrl);
    const graphData = await stockResponse.json();
    hideLoadingForChart();
    let graphLabels = [];
    let graphClosePrices = [];
    // Going to fetch 30 days of stock data as i
    for (let i = 0; i < 30; i++) {
      graphLabels.push(graphData.historical[i].date);
      graphClosePrices.push(graphData.historical[i].close);
    }

    // These arrays need to be reversed to show the graph data moving forwards in time rather than backwards
    const ctx = document.getElementById("myChart");
    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: graphLabels.reverse(),
        datasets: [
          {
            label: "Recent stock history",
            data: graphClosePrices.reverse(),
            borderWidth: 1,
            fill: true,
            backgroundColor: "#FF2F7B",
          },
        ],
      },
      options: {
        // Styles go here, among other things
      },
    });
  } catch (err) {
    console.log(err);
  }
};
stockHistoryFetch();
