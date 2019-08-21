const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/music');

var bandMemberSchema = new mongoose.Schema({
	fname: String,
	lname: String,
	status: String
});
var BandMember = mongoose.model('members', bandMemberSchema);

var bandSchema = new mongoose.Schema({
	name: String,
	genre: String,
	country: String,
	yr_formed: String,
	yr_disbanded: String,
	member_ids: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'members'
	}]
});
var Band = mongoose.model('bands', bandSchema);

app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

/******* ROUTES *********/

// ROOT route
app.get('/', (req, res) => {
	res.redirect('/artists');
});

// ARTIST INDEX route
app.get('/artists', (req, res) => {
	Band.find()
		.then((bands) => {
			res.render('artistindex', {
				bands: bands
			});
		})
		.catch((err) => {
			console.log('Error: ', err);
		});
});

// ARTIST ITEM route
app.get('/artist/:id', (req, res) => {
	Band.findById(req.params.id)
		.populate('member_ids')
		.exec((err, foundBand) => {
			if (err) {
				console.log('Error: ', err);
				res.redirect('/artists');
			} else {
				res.render('artist', {
					band: foundBand
				});
			}
		});
});

// NEW MUSICIAN
app.get('/artist/:id/musician/new', (req, res) => {
	Band.findById(req.params.id)
		.then((band) => {
			res.render('newmusician', {
				band: band
			});
		})
		.catch((err) => {
			console.log('Error: ', err);
		});
});

app.post('/artist/:id/musician', (req, res) => {
	Band.findById(req.params.id)
		.then((band) => {
			BandMember.create(req.body.musician)
				.then((musician) => {
					band.member_ids.push(musician);
					band.save();
					res.redirect(`/artist/${band._id}`);
				})
				.catch((err) => {
					console.log(data);
				});
		})
		.catch((err) => {
			console.log(data);
		});
});

// listener
app.listen(3000, (req, res) => {
	console.log('Listening on port 3000...');
});