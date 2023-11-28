// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/style.css'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
import count from './count.js';

console.log('Hello, world!');

var playerImg = document.querySelector(".playerImg");
var sqrtScale;


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
				
				const s20Averages = data.data.map(item => ({
					points: item.pts,
					steals: item.stl,
					blocks: item.blk,
					assists: item.ast,
					rebounds: item.reb,
					fga: item.fga,
					fgm: item.fgm,
				}));
				console.log("data", s20Averages);

				const numericValues = Object.values(s20Averages[0]);
				console.log("numbers", numericValues);
		
				// Continue with the rest of your code using numericValues
				const sqrtScale = d3.scaleSqrt()
					.domain([0, d3.max(numericValues)])
					.range([5, 30]);

				var w = 500;
				var h = 500;	
		
				const svg = d3.select("#stats")
					.append("svg")
					.attr("width", w)
					.attr("height", h)
					.selectAll("circle")
					.data(numericValues)
					.enter()
					.append("g")
					// translate moved een element van zijn positie ("translate(x,y)") 
					// ${i * 50} - elk element in g wordt met een x 50 op de x-as verplaatst van index
					// ${h / 2} - half van de totale hoogte van h voor alles in g (g als geheel)
					.attr("transform", (d, i) => `translate(${i * 50},  ${h / 2})`)
					.append("circle")
					.attr("cx", 0)
					.attr("cy", 0)
					.attr("r", d => sqrtScale(d));
			})
			.catch(error => console.error("Error fetching data:", error));

				
							  
							

//vincent codepen force
	});

};



