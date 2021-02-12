// Tutorial this exten sion is loosely based on
// https://github.com/onedebos/covtension/blob/master/src/index.js
const log = console.log

import axios from "axios";

// API endpoints
const api = "https://ed57d60bf67b.ngrok.io/";
// const api = "https://dev-know-your-news.herokuapp.com/";
// const api = "https://know-your-news.herokuapp.com/";
const analysis_api = api + "analysis";
const error_report_api = api + "error_report";
// Retrieve elements from html

// Errors and Loading Elements
const errors = document.getElementsByClassName("errors")[0];
const loading = document.getElementsByClassName("loading")[0];

// Results element is the parent container for all results
const results_container = document.getElementsByClassName("result-container")[0];

// Article specific elements
const article_container = document.getElementsByClassName("article-container")[0];
const title = document.getElementsByClassName("title")[0];
const title_sentiment = document.getElementsByClassName("title-sentiment")[0];
const sentiment = document.getElementsByClassName("sentiment")[0];
const topic = document.getElementsByClassName("topic")[0];

// Media Bias Fact Checker data
const mbfc_container = document.getElementsByClassName("mbfc-container")[0]; // holds all mbfc results
const bias = document.getElementsByClassName("bias")[0];
const source = document.getElementsByClassName("source")[0];
const factual_reporting = document.getElementsByClassName("factual-reporting")[0];
const mbfc_url = document.getElementsByClassName("mbfc-url")[0];

// Related News
const related_news_container = document.getElementsByClassName("related-news-container")[0]; // holds all related news results
const similar_news_title = document.getElementsByClassName("similar-news-title")[0];
const similarity_score = document.getElementsByClassName("similarity-score")[0];

// User Error reporting
const report_error = document.getElementsByClassName("report-error")[0];
const report_error_text = document.getElementsByClassName("report-error-text")[0];
const check_boxes = document.getElementsByClassName("checkbox");
const submit_error_report = document.getElementById("submit-error-report");

// const article_error_btn = document.getElementById("article-error");
// const mbfc_error_btn = document.getElementById("mbfc-error");
// const related_news_error_btn = document.getElementById("related-news-error");

// Elements displays (what elements can be seen by user to begin with)

// display nothing to begin with
errors.style.display = "none";
loading.style.display = "none";
results_container.style.display = "none";
article_container.style.display = "none";
mbfc_container.style.display = "none";
related_news_container.style.display = "none";
submit_error_report.style.display = "none";

// Hide checkboxes for error reporting
const hide_checkboxes = () => {
  for (let i=0; i < check_boxes.length; i++) {
    let box = check_boxes[i];
    box.style.display = "none";
  }
}
hide_checkboxes()

// make global so error reporting has access to it
let current_url;
// declare a method to start the analysis
/*
Expected API response
{
  "title": title,
  "topics": topics,
  "sentiment": {
    "title": title_sentiment,
    "text": text_sentiment
  },
  "mbfc": mbfc,
  "related_news": {
    "most_similar_title": similar_article_title,
    "most_similar_url": similar_url,
    "similarity_score": similarity_score
  }
}
*/
const analyse_page = () => {
  loading.style.display = "block"; // 'loading...' is displayed
  errors.style.textContent = ""; // if error text was displayed previously it is reset

  // Retrieve the current tab, this call is async
  chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
    current_url = tabs[0].url.toString();

    // call api
    try {
      axios.post(analysis_api, {
        url: current_url
      })
      .then((response) => {
        log(response)
        // Response is successful
        // Populate Article info
        title.textContent = response.data.title;
        title_sentiment.textContent = response.data.sentiment.title;
        sentiment.textContent = response.data.sentiment.text;
      
        // Iterate over topics and add list items
        const topic_list = response.data.topics; // type array
        for (let i=0; i < topic_list.length; i++) {
          let item = topic_list[i]
          const topic_item = document.createElement('li') // create list item
          const topic_text = document.createTextNode(item) // create text node with topic
          topic_item.appendChild(topic_text)
          topic.appendChild(topic_item)
        }
        // topic.innerHTML = response.data.topics;
        article_container.style.display = "block";

        // media bias data is not null, populate mbfc info
        if (response.data.mbfc != null) {
          source.textContent = response.data.mbfc.Source
          bias.textContent = response.data.mbfc.Bias
          mbfc_url.href = response.data.mbfc.URL
          const facts = response.data.mbfc["Factual Reporting"]
          // Factual Reporting is Null when the site is satire
          if (facts == ""){
           factual_reporting.textContent = "Comedic News, Non-Factual"
          } else {
            factual_reporting.textContent = facts
          }
          // This news source has been mislabeled in the past and could be wrong in this situation
          // However, this user could be on the correct news source for this labelling.
          if ("reported_error" in response.data.mbfc) {
            mbfc_container.classList.add('errors')
            const p_tag = document.createElement('p')
            const strong = document.createElement('strong')
            const warning = document.createTextNode('Warning: This may be the wrong source') 
            strong.appendChild(warning)
            p_tag.appendChild(strong)
            mbfc_container.prepend(p_tag);
          }
          mbfc_container.style.display = "block";
        }
        // mbfc is null, do not display div
        else {
          mbfc_container.style.display = "none";
        }
        log("Just above similar news")
        // NOTE: response.data.related_news.similarity_score could be undefined. Need to test if this will fail
        if (response.data.related_news != null || response.data.related_news.similarity_score != null) {
          log("Inside similar news")
          similar_news_title.textContent = response.data.related_news.most_similar_title;
          similar_news_title.href = response.data.related_news.most_similar_url;
          similarity_score.textContent = response.data.related_news.similarity_score + '%';
          log("done similar news")
          // display related news div
          related_news_container.style.display = "block";
        } else {
          related_news_container.style.display = "none";
        }

        // Indicate that a a User marked this article as incorrect
        if ("reported_error" in response.data) {
          log("error with specifc url")
          errors.textContent = "A User indicated that our analysis on this Article in incorrect";
          errors.style.display = "block";
        }

        // hide loading, display results
        loading.style.display = "none";
        results_container.style.display = "block";
      })
      .catch(error => {
        // Hide loading, display error
        loading.style.display = "none";
        errors.textContent = "Uh oh! Our server said it '" + error.response.data + "'. Try again?";
        errors.style.display = "block";
        log(error.response) 
      })
    } catch (error) {
      // Hide loading, display error
      loading.style.display = "none";
      errors.textContent = "Uh oh! It seems our services are down, sorry for the inconvenience!";
      errors.style.display = "block";
    }
  })
}

/*
When the user clicks that there is an error, display check boxes.
Wait until they select 'submit error report' then make API call with error info
*/
report_error.addEventListener('click', () => {
  // Unhide checkboxes
  for (let i=0; i < check_boxes.length; i++) {
    let box = check_boxes[i];
    box.style.display = "block";
  }
  report_error_text.innerHTML = "Select the boxes with errors, then submit.";
  submit_error_report.style.display = "block";
})


function getSelectedCheckboxValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  let values = [];
  checkboxes.forEach((checkbox) => {
      values.push(checkbox.value);
  });
  return values;
}

submit_error_report.addEventListener('click', () => {
  log("Recorded Errors")
  try {
    axios.post(error_report_api, {
      url: current_url,
      errors: getSelectedCheckboxValues('error_box')
    })
    .then((response) => {
      report_error_text.textContent = "We have been notifed, thank you!";
      submit_error_report.style.display = "none";
      hide_checkboxes()
    }) 
    .catch(error => {
      // NOTE: because I am only using the first index of class report, this inner HTML may not work. Needs to be tested
      report_error_text.innerHTML = "Uh oh! Our server had an issue. <strong class='report-error'>Try again?</strong>";
    })
  } catch (error) {
    report_error_text.textContent = "Uh oh! It seems our services are down, sorry for the inconvenience!";
  }
});


// Run when icon selected
analyse_page();

