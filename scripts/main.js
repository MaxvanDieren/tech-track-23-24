// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/style.css'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
import count from './count.js';

console.log('Hello, world!');

var playerImg = document.querySelector(".playerImg");


//confirm code - fetch works
fetch("https://www.balldontlie.io/api/v1/season_averages?seasons=2016&player_ids[]=237")
.then(res => res.json())
.then(data => console.log(data));



//fetch met ordening data werkt wel?
function getData() {
	fetch('https://www.balldontlie.io/api/v1/teams')
	.then(res => res.json())
	.then(data => {
		//data.map geen functie -> data.data.map 
		const teams = data.data.map(item => {
			let newItem = {
				name: item["full_name"],
				city: item["city"],
			}

			return newItem
		})
		console.log(teams);
	});
}

getData();

//CODE FOR PAGE
//const
const searchBar = document.getElementById("searchBar");
const button = document.getElementById("search_button");

//var
var playerImg = document.querySelector(".playerImg");


button.addEventListener('click', searchValue);

function searchValue(e) {
	e.preventDefault();
	const input = document.getElementById("searchBar").value.toLowerCase();
	console.log(input)
	fetch("https://www.balldontlie.io/api/v1/players?search="+searchBar.value)
	.then(res => res.json())
	.then(data => 
		
	{
		const playa = data.data.map(item => {
			let newItem = {
				name: item["first_name"] + " " + item["last_name"] ,
				ID: item["id"],
				position: item["position"],
				team: item["team"]["full_name"],
			}
			return newItem
		});
		
		

		d3.select("#playerInfo h1") 
		  .text(playa[0].name)
		console.log(playa)
		d3.select("#position")
		  .text("Position: "+ playa[0].position)
		d3.select("#team")
		  .text("Team: "+ playa[0].team)

			//https://www.balldontlie.io/api/v1/season_averages?seasons[]=2018&seasons[]=2015&player_ids[]=237 goede fetch
		  fetch("https://www.balldontlie.io/api/v1/season_averages?seasons=2020&player_ids[]="+playa[0].ID)
		  .then(res => res.json())
		  .then(data =>
			  {
				  const s20Avereges = data.data.map(item => {
					  let newItem2 = {
						  pts: item["pts"],
						  stl: item["stl"],
						  blk: item["blk"],
						  ast: item["ast"],
						  reb: item["reb"],
						  fga: item["fga"],
						  fgm: item["fgm"],

					  }
					  return newItem2
				  });
				  console.log(s20Avereges,"yo");

				  var w = 500;
				  var h = 500;

				  const svg = d3.select("#stats")
				  				.append("svg")
								.attr("witdh", w)
								.attr("height", h)
				  			 svg.selectAll("circle")
				  				.data(s20Avereges)
								.enter()
								.append("circle")
								.attr("x", (d,i)=>  i * 3) 
								.attr("cx", 100)
								.attr("cy", 100)
								.attr("r",5);

//vincent codepen force
			  });

	});
	
	
}



