import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CosmeticSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cosmetics, setCosmetics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        brand: '',
        productType: '',
        priceMin: '',
        priceMax: ''
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Product types from the makeup API
    const productTypes = [
        'blush', 'bronzer', 'eyebrow', 'eyeliner', 'eyeshadow',
        'foundation', 'lip_liner', 'lipstick', 'mascara', 'nail_polish'
    ];

    // Popular brands
    const popularBrands = [
        'maybelline', 'covergirl', 'nyx', 'revlon', 'l\'oreal',
        'milani', 'physicians formula', 'wet n wild', 'essie'
    ];

    // Default fallback image URL - using a simple color background instead of external service
    const fallbackImageUrl = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve">
<g id="BACKGROUND">
	<ellipse style="fill:#F5F5FF;" cx="260.935" cy="231.996" rx="150.609" ry="134.674"/>
</g>
<g id="OBJECTS">
	<path style="fill:#545FAC;" d="M321.352,388.504H314.2c-31.526,0-57.083-25.557-57.083-57.083v-44.033   c0-31.526,25.557-57.083,57.083-57.083h7.152c31.526,0,57.083,25.557,57.083,57.083v44.033   C378.435,362.947,352.878,388.504,321.352,388.504z"/>
	<path style="fill:#545FAC;" d="M321.352,388.504H314.2c-31.526,0-57.083-25.557-57.083-57.083v-44.033   c0-31.526,25.557-57.083,57.083-57.083h7.152c31.526,0,57.083,25.557,57.083,57.083v44.033   C378.435,362.947,352.878,388.504,321.352,388.504z"/>
	<path style="fill:#3F4781;" d="M311.969,388.504h-15.816c-29.799,0-53.956-24.157-53.956-53.956V284.26   c0-29.799,24.157-53.956,53.956-53.956h15.816c29.799,0,53.956,24.157,53.956,53.956v50.288   C365.925,364.347,341.768,388.504,311.969,388.504z"/>
	<g>
		<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M255.939,186.331    c0,0-17.148,52.38-22.379,74.205"/>
		<g>
			<path style="fill:#BA6F4C;" d="M328.475,167.106c0,0-10.063-8.804-10.544-9.012c-0.481-0.208-6.268-5.326-13.111-4.546     l14.013,31.724c0,0-5.265,4.433-4.239,7.125c1.026,2.692,4.755-1.722,6.675-2.539c1.92-0.817,5.1-4.544,6.023-6.154     C328.214,182.094,328.475,167.106,328.475,167.106z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M312.574,164.344     c0,0,3.632,8.245,8.539,10.208"/>
			<path d="M306.881,161.891c0,0,36.513,48.292,37.691,77.738c0,0-32.097,53.396-106.301,13.055l13.251-65.174L306.881,161.891z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M311.69,168.369     c0,0,21.594,30.624,36.906,61.248"/>
			<path style="fill:#9EC68A;" d="M312.181,229.911c0,0,45.936-8.834,67.432-6.478c0,0,13.251,15.018,18.257,24.735l-38.673,24.342     c0,0,4.515,59.874-11.091,98.449H202.347c0,0,8.477-82.505,15.607-96.289c4.417-8.539,8.343-17.962,29.152-25.618     c20.809-7.656,24.44-14.723,24.44-14.723L312.181,229.911z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M310.694,230.779     c0,0,5.176-0.636,6.493,7.401"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M271.372,241.336     c0,0-5.935,5.286-1.09,13.463"/>
			
				<line style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" x1="232.382" y1="280.559" x2="241.805" y2="293.221"/>
			<path style="fill:#BA6F4C;" d="M286.268,252.585L286.268,252.585c-10.191,0-12.956-14.249-12.956-24.44l0.294-21.986h36.906     v27.589C310.513,243.939,296.46,252.585,286.268,252.585z"/>
			<path d="M307.067,206.158h-33.461l-0.294,21.987c0,6.231,1.038,13.974,4.171,19.055     C296.073,244.128,304.231,225.795,307.067,206.158z"/>
			<path style="fill:#BA6F4C;" d="M327.291,183.704l64.542,68.44c0,0,13.3-4.76,21.152-14.969     c7.852-10.208-8.736-27.876-30.722-42.01s-55.114-29.152-55.114-29.152S326.506,170.747,327.291,183.704z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M343.885,296.853     c0,0-3.534,35.949-35.728,34.005"/>
			<g>
				<path style="fill:none;stroke:#FFFFFF;stroke-linecap:round;stroke-miterlimit:10;" d="M259.261,222.928      c1.103,1.531,1.62,3.921,1.233,6.483c-0.62,4.1-3.318,7.093-6.027,6.683c-2.709-0.409-4.403-4.065-3.784-8.166      c0.369-2.445,1.477-4.495,2.886-5.666"/>
				<path style="fill:#BA6F4C;" d="M242.958,179.731c0,0-0.886,58.963,32.318,63.035c28.879,3.542,33.402-44.91,31.33-63.296      c-2.072-18.386-10.252-28.056-32.833-27.706C240.369,152.281,242.958,179.731,242.958,179.731z"/>
				<path d="M303.053,191.042l0.86,4.581c0,0,18.791,2.52,23.581-0.458c0,0-10.652-28.722-17.962-37.397      c-7.31-8.675-17.697-16.782-40.636-13.545c-22.939,3.237-28.465,25.226-28.465,25.226s-5.497,15.14,4.712,32.612      c0,0,0.104-20.012,4.515-25.839C249.657,176.221,270.788,199.976,303.053,191.042"/>
				<path style="fill:#BA6F4C;" d="M312.109,208.384c-1.433,6.688-6.308,11.315-10.887,10.333c-4.579-0.981-7.13-7.199-5.696-13.887      c1.433-6.688,6.308-11.315,10.887-10.333C310.992,195.478,313.542,201.696,312.109,208.384z"/>
				<g>
					<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M307.41,202.593       c0,0-4.381-3.761-6.32,3.682c0,0,2.586,2.742,1.149,5.093c0,0,2.442,0.47,3.519-1.959"/>
					<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M305.73,205.494       c0,0-0.311-1.612-2.027-3.373"/>
				</g>
				<g>
					<path d="M277.813,210.176c0.056,1.66-0.706,3.034-1.702,3.068c-0.996,0.034-1.85-1.285-1.906-2.945       c-0.056-1.66,0.706-3.034,1.702-3.068C276.903,207.197,277.757,208.516,277.813,210.176z"/>
					<path d="M256.216,213.105c0.056,1.66-0.706,3.034-1.702,3.068s-1.85-1.285-1.906-2.945c-0.056-1.661,0.706-3.034,1.702-3.068       C255.307,210.126,256.16,211.445,256.216,213.105z"/>
					<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M253.402,204.602       c0,0-0.768,3.374-3.843,2.439"/>
					<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M277.689,202.183       c0,0-4.48,1.47-7.082-1.486"/>
					<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M260.133,218.326       c0,0-0.762,2.878,0.72,3.306c1.482,0.428,3.458,0.999,5.319-0.196c1.861-1.195,3.739-0.623,2.041-3.111"/>
				</g>
				<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M305.409,189.423      c-37.691,17.668-56.144-12.711-56.144-12.711s-1.276,1.865,7.264,13.349"/>
				<path style="fill:none;stroke:#FFFFFF;stroke-linecap:round;stroke-miterlimit:10;" d="M310.079,213.981      c1.469,1.004,2.693,2.956,3.172,5.352c0.766,3.834-0.667,7.352-3.2,7.857c-2.533,0.506-5.207-2.192-5.973-6.025      c-0.456-2.285-0.132-4.459,0.742-5.948"/>
				<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M280.674,233.396      c0,0,0.663-3.779,3.975-3.779"/>
			</g>
			<path style="fill:#BA6F4C;" d="M364.694,223.041c0,0-2.945,33.176,27.14,29.103L364.694,223.041z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M364.694,223.041     c0,0,9.03,12.466,18.453,14.232"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M345.161,371.254     c0,0,12.85-42.384,11.484-98.939c0,0-0.646-0.329-2.474-1.348c-2.652-1.479-6.824-4.287-10.777-8.958"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M384.521,252.781     c0,0-22.281,16.588-27.876,19.533"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M316.869,231.868     c0,0,5.63,24.247-24.429,29.877c-25.857,4.843-25.972-18.707-25.972-18.707"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M300.795,248.078     c0,0,3.496,1.683,3.356,9.581"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M306.698,242.993     c0,0,3.633,2.316,3.496,10.625"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M310.694,236.273     c0,0,4.06,2.347,3.905,11.442"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M275.527,244.151     c0,0-4.45,5.812-0.817,14.802"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M279.314,249.486     c0,0-2.27,4.998,1.934,12.282"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M286.374,253.05     c0,0-0.259,5.794,1.208,9.127"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M294.257,251.688     c0,0,1.993,3.182,1.578,9.127"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M308.764,254.889     c0,0-10.512,13.94-29.037,13.94"/>
		</g>
		<polygon style="fill:#C6D3F7;" points="389.974,398.295 46.33,398.295 90.2,370.91 433.843,370.91   "/>
		<g>
			<g>
				<path style="fill:#BA6F4C;" d="M139.039,359.217c-3.772-2.656-8.79-4.012-13.963-4.059c-6.805-0.062-16.093,1.326-19.16,1.679      c-1.889,0.217-1.919-2.672-7.641,4.884c-2.261,2.986-2.862,3.741-3.162,4.772c-0.3,1.031,0.53,12.775,3.424,13.693      c0.09,0.029,0.163-0.016,0.25-0.023c0.151,0.951,0.916,2.476,1.631,3.39c0.457,0.584,3.114,1.786,3.949-2.63      c0,0,0.65,3.587,2.653,4.86c2.079,1.321,3.019-1.132,3.263-3.102c0.266,1.709,1.554,4.562,3.336,3.921      c3.494-1.257,1.749-11.501,1.749-11.501l4.097-7.394l5.815,1.369c0,0,12.128,5.36,16.817-1.683      C144.245,364.166,142.049,361.336,139.039,359.217z"/>
				<g>
					<polyline style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" points="103.7,359.554 97.947,367.816        99.247,379.668      "/>
					<polyline style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" points="108.078,361.265        103.53,370.552 104.367,380.925      "/>
					<polyline style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" points="114.295,362.997        109.966,371.785 110.27,381.205      "/>
				</g>
			</g>
			<path style="fill:#BA6F4C;" d="M131.259,368.935c0,0-6.522,6.82-4.685,9.678c1.837,2.858,17.603-10.295,14.418-11.874     C136.327,364.427,131.259,368.935,131.259,368.935z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M127.938,366.174     c0,0,2.708,1.619,1.568,4.738"/>
		</g>
		<g>
			<path style="fill:#8796FF;" d="M278.318,373.462l31.159,0.699c0.93,0.021,1.674,0.781,1.674,1.712v2.519     c0,0.674-0.395,1.285-1.01,1.561l-23.872,10.735l-6.89,0.294L278.318,373.462z"/>
			<path style="fill:#E1E7F7;" d="M310.141,375.732l-23.872,10.736l-6.89,0.294v4.221l6.89-0.294l23.872-10.736     c0.615-0.276,1.01-0.888,1.01-1.561v-2.519c0-0.313-0.09-0.602-0.236-0.855C310.738,375.325,310.477,375.581,310.141,375.732z"/>
			<path style="fill:#FFFFFF;" d="M282.323,390.983h-143.17c-2.286,0-4.248-1.674-4.666-3.982l-19.007-89.804     c-0.544-2.998,4.215-6.92,7.184-6.92h143.17c2.286,0,4.248,1.674,4.666,3.983l16.489,90.957     C287.533,388.214,285.293,390.983,282.323,390.983z"/>
			<path style="fill:#8796FF;" d="M259.178,296.607l7.225-6.279c-0.188-0.023-0.375-0.052-0.569-0.052h-143.17     c-2.97,0-7.728,3.922-7.184,6.92l2.508,11.852l56.188,1.645L259.178,296.607z"/>
			<path style="fill:#E1E7F7;" d="M286.99,385.216l-16.155-89.113c-1.338,0.685-3.355,2.155-4.295,5.069     c-1.127,3.494-0.356,62.391,0.068,89.811h15.716C285.293,390.983,287.533,388.214,286.99,385.216z"/>
			<path style="fill:#545FAC;" d="M279.379,390.983h-143.17c-2.286,0-4.248-1.63-4.666-3.878l-16.489-88.563     c-0.544-2.919,1.697-5.615,4.666-5.615h143.17c2.286,0,4.248,1.63,4.666,3.878l16.489,88.563     C284.589,388.287,282.348,390.983,279.379,390.983z"/>
			
				<ellipse transform="matrix(0.9027 -0.4302 0.4302 0.9027 -130.6394 116.6848)" style="fill:#7584F1;" cx="192.694" cy="347.212" rx="11.64" ry="15.607"/>
		</g>
		<rect x="46.33" y="398.295" style="fill:#7584F1;" width="343.644" height="7.116"/>
		<polygon style="fill:#8AA5EB;" points="389.974,405.411 433.843,378.026 433.843,370.91 389.974,398.295   "/>
		<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M261.019,250.485    c0,0,8.173,31.33,25.609,31.875"/>
	</g>
	<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M314.046,169.252"/>
	<g>
		<g>
			<path style="fill:#7E9E6E;" d="M405.557,326.094c0,0-2.977-1.138,0.826-8.563c3.613-7.053,7.558-13.665,16.325-19.073     c0,0-0.83,14.556-6.251,20.155C411.036,324.212,405.557,326.094,405.557,326.094z"/>
			<path style="fill:#7E9E6E;" d="M428.817,327.065c0,0-9.083,6.092-25.851,6.73c0,0,0.733-2.219,7.772-5.734     C417.776,324.545,430.461,324.799,428.817,327.065z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M428.817,327.065     c0,0-12.204-1.98-25.851,6.73c0,0-1.391,0.989-2.559,3.758"/>
			<path style="fill:#7E9E6E;" d="M422.344,339.625c0,0-9.035,11.398-25.803,12.036c0,0,2.232-7.444,9.271-10.96     C412.851,337.186,423.988,337.36,422.344,339.625z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M422.344,339.625     c0,0-11.626-1.153-25.803,12.036c0,0-1.66,1.601-2.829,4.37"/>
			<path style="fill:#7E9E6E;" d="M397.869,337.304c0,0-2.085,1.846-6.653-0.567c-4.568-2.414-7.326-10.818-11.038-10.777     C380.178,325.959,389.443,325.502,397.869,337.304z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M390.8,366.223     c3.104-11.851,7.769-25.779,14.757-40.129c0,0,1.668-3.872,7.837-14.662s9.314-12.974,9.314-12.974"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M381.287,326.014     c0,0,8.964,0.613,16.582,11.289c1.845,2.586,0.52,5.769-0.584,8.225"/>
		</g>
		<path style="fill:#545FAC;" d="M379.485,360.052l4.353,23.999c0,1.471,4.644,2.663,10.373,2.663    c5.729,0,10.373-1.192,10.373-2.663l4.354-23.999H379.485z"/>
		<path d="M408.937,360.052c0,1.471-6.593,2.663-14.726,2.663s-14.726-1.192-14.726-2.663c0-1.471,6.593-2.663,14.726-2.663    S408.937,358.581,408.937,360.052z"/>
	</g>
	<g>
		<g>
			<path style="fill:#D3DDF7;" d="M352.231,70.326c-17.604,0.48-32.169,14.58-33.182,32.161     c-0.596,10.338,3.41,19.745,10.153,26.382c0.996,0.981,1.459,2.379,1.226,3.757l-2.532,14.984l15.579-9.077     c0.888-0.517,1.933-0.707,2.94-0.504c3.808,0.768,7.843,0.91,12.002,0.28c15.39-2.332,27.397-15.073,28.817-30.574     C389.126,87.073,372.624,69.77,352.231,70.326z"/>
		</g>
		<g>
			<path d="M352.249,119.779c-0.473,0-0.836-0.15-1.088-0.449c-0.253-0.299-0.378-0.716-0.378-1.253     c0-0.504,0.133-0.914,0.402-1.229c0.267-0.315,0.622-0.473,1.064-0.473c0.504,0,0.875,0.15,1.111,0.449     c0.237,0.3,0.355,0.717,0.355,1.253c0,0.473-0.127,0.875-0.379,1.206C353.084,119.613,352.723,119.779,352.249,119.779z      M351.958,108.004c-0.036-0.977-0.072-1.978-0.108-3.003c-0.036-1.024-0.063-2.049-0.081-3.074     c-0.018-1.024-0.01-2.073,0.027-3.145V86.298h1.186l0.055,12.485c0,1.072-0.01,2.12-0.027,3.145     c-0.019,1.025-0.046,2.05-0.081,3.074c-0.037,1.025-0.073,2.026-0.109,3.003H351.958z"/>
		</g>
	</g>
	<g>
		<g>
			<path style="fill:#D3DDF7;" d="M98.768,184.174c-1.697,0.003-3.341-0.59-4.646-1.675l-3.62-3.011     c-1.303-1.083-2.849-1.663-4.432-1.66l-17.942,0.028c-1.628,0.003-2.946,1.324-2.943,2.952l0.005,3.419l0.096,61.536     c0.004,2.809,2.285,5.083,5.095,5.079l89.439-0.14c2.185-0.004,3.954-1.778,3.951-3.963l-0.092-58.709     c-0.003-2.185-1.778-3.954-3.963-3.951L98.768,184.174z"/>
			<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M153.209,199.041h-18.134     c-1.39,0-2.516-1.126-2.516-2.516l0,0c0-1.39,1.126-2.516,2.516-2.516h18.134c1.39,0,2.516,1.126,2.516,2.516l0,0     C155.725,197.915,154.598,199.041,153.209,199.041z"/>
			
				<line style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" x1="93.112" y1="186.415" x2="160.205" y2="186.415"/>
		</g>
		<g>
			
				<line style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="125.867" y1="209.934" x2="104.065" y2="231.737"/>
			
				<line style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="125.867" y1="231.737" x2="104.065" y2="209.934"/>
		</g>
	</g>
	<path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-miterlimit:10;" d="M310.513,233.747   c0,10.191-14.053,18.838-24.244,18.838l0,0"/>
</g>
</svg>
        </svg>
      `)}`;

    const handleSearch = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Build the query URL with filters
            let url = 'https://makeup-api.herokuapp.com/api/v1/products.json';
            const params = new URLSearchParams();

            if (searchQuery.trim()) {
                params.append('name', searchQuery);
            }

            if (filters.brand) {
                params.append('brand', filters.brand);
            }

            if (filters.productType) {
                params.append('product_type', filters.productType);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url);

            // Filter by price if specified
            let filteredResults = response.data;

            if (filters.priceMin) {
                filteredResults = filteredResults.filter(
                    item => item.price && parseFloat(item.price) >= parseFloat(filters.priceMin)
                );
            }

            if (filters.priceMax) {
                filteredResults = filteredResults.filter(
                    item => item.price && parseFloat(item.price) <= parseFloat(filters.priceMax)
                );
            }

            setCosmetics(filteredResults);
        } catch (err) {
            setError('Failed to fetch cosmetics. Please try again.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load initial data when component mounts
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Get a mix of popular products to show initially
                const response = await axios.get('https://makeup-api.herokuapp.com/api/v1/products.json?product_type=lipstick&limit=20');
                setCosmetics(response.data.slice(0, 20)); // Limit to 20 items
            } catch (err) {
                setError('Failed to fetch initial cosmetics data.');
                console.error('Initial fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            brand: '',
            productType: '',
            priceMin: '',
            priceMax: ''
        });
    };

    const viewCosmeticDetails = (id) => {
        navigate(`/cosmetics/${id}`);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-2 text-purple-700">Suggested Cosmetic Products</h1>
                <p className="text-center text-gray-600 mb-6">Find and explore beauty products from top brands</p>

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-grow">
                        <input
                            type="text"
                            placeholder="Search cosmetics by name..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </span>
                        ) : 'Search'}
                    </button>
                    <button
                        type="button"
                        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </form>

                {/* Filters */}
                {isFilterOpen && (
                    <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Brand filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                <select
                                    name="brand"
                                    value={filters.brand}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="">All Brands</option>
                                    {popularBrands.map(brand => (
                                        <option key={brand} value={brand}>{brand.charAt(0).toUpperCase() + brand.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Product type filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                <select
                                    name="productType"
                                    value={filters.productType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="">All Types</option>
                                    {productTypes.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price range filters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
                                <input
                                    type="number"
                                    name="priceMin"
                                    placeholder="Min"
                                    min="0"
                                    step="0.01"
                                    value={filters.priceMin}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
                                <input
                                    type="number"
                                    name="priceMax"
                                    placeholder="Max"
                                    min="0"
                                    step="0.01"
                                    value={filters.priceMax}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
                            >
                                Clear Filters
                            </button>
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            )}

            {/* Results */}
            {!loading && cosmetics.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No cosmetics found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}

            {!loading && cosmetics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cosmetics.map((cosmetic) => (
                        <div
                            key={cosmetic.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            onClick={() => viewCosmeticDetails(cosmetic.id)}
                        >
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {/* Simple IMG with guaranteed fallback */}
                                <img
                                    src={cosmetic.image_link || fallbackImageUrl}
                                    alt={cosmetic.name || "Cosmetic product"}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite error loop
                                        e.target.src = fallbackImageUrl; // Use inline SVG as fallback
                                    }}
                                />
                                {cosmetic.price && (
                                    <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        ${parseFloat(cosmetic.price).toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-purple-600 font-medium mb-1">{cosmetic.brand}</p>
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{cosmetic.name}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                    {cosmetic.product_type?.replace('_', ' ') || 'Cosmetic'}
                                </p>

                                {/* Product colors preview */}
                                {cosmetic.product_colors && cosmetic.product_colors.length > 0 && (
                                    <div className="flex mt-2 overflow-hidden">
                                        {cosmetic.product_colors.slice(0, 5).map((color, index) => (
                                            <div
                                                key={index}
                                                className="w-6 h-6 rounded-full border border-gray-300 mr-1"
                                                style={{ backgroundColor: color.hex_value }}
                                                title={color.colour_name}
                                            ></div>
                                        ))}
                                        {cosmetic.product_colors.length > 5 && (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                +{cosmetic.product_colors.length - 5}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="mt-3 w-full px-4 py-2 bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors text-sm font-medium"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        viewCosmeticDetails(cosmetic.id);
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CosmeticSearch;