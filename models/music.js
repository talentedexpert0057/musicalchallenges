var mongoose = require("mongoose");
var mongoPaginate = require("mongoose-pagination");
// Export your module
var MusicModel = mongoose.model("Musics", function() {

    var s = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        pcat_id: {
            type: String,
            required: true
        },
        songs_name: {
            type: String,
            required: true
        },
        artist_name: {
            type: String,
            required: true
        },
        karaoke_length: {
            type: String
        },
        image_url: {
            type: String

        },
        lyrics_url: {
            type: String

        },
        file_url: {
            type: String

        },
        dance_url: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });
    s.statics.insertMusic = function(musicData, callback) {
        this.getMusicByName({ sname: musicData.songs_name, artist: musicData.artist_name, type: musicData.cat_type }, function(res) {
            if (res === null) {
                console.log("started to save! ... ");
                new MusicModel(musicData).save(function(err, response_data) {
                    if (!err) {
                        callback({ "response_code": 2000, response_data });
                    } else {
                        console.log(err);
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": {}
                        })
                    }
                })
            } else {

                ////console.log("[Music already exist]");
                callback({
                    "response_code": 5000,
                    "response_message": "Music already exist",
                    "response_data": res

                })

            }
        })
        console.log("end all !!!");
    }
    s.statics.getMusicByName = function(req, callback) {
        MusicModel.findOne({
                songs_name: req.sname,
                artist_name: req.artist,
            },
            function(err, res) {
                if (err)
                    console.log(err);
                else if (!err) {
                    console.log(res);
                    callback(res);
                }
            })
    }
    s.statics.getAllMusic = function(req, callback) {
        var prams = {}

        if (req.cat_id) {
            prams.cat_id = req.cat_id
        }
        MusicModel.find(prams, function(err, res) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                })
            }

        }).paginate(req.number, 10, function(err, res, total) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": []
                })
            }
            if (!err) {
                // //console.log(res);
                if (res.length === 0) {
                    callback({
                        "response_code": 5002,
                        "response_message": "No Karaoke found",
                        "response_data": []
                    })
                } else {
                    callback({
                        "response_code": 2000,
                        "message": "Success",
                        "total_records": total,
                        "response_data": res
                    });
                }
            }



        });
    }
    s.statics.getMusicByCategories = function(req, callback) {
        MusicModel.find({
            $or: [
                { pcat_id: { $in: req.cat_id } }
            ]
        }, function(err, res) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                })
            }


        }).paginate(req.page_count, 10, function(err, res, total) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": []
                })
            }
            if (!err) {
                if (res.length === 0) {
                    callback({
                        "response_code": 5002,
                        "response_message": "No Karaoke found",
                        "response_data": []
                    })
                } else {
                    callback({
                        "response_code": 2000,
                        "message": "Success",
                        "total_records": total,
                        "response_data": res
                    });
                }
            }
        });
    }
    s.statics.updateMusic = function(musicData, callback) {
        MusicModel.update({
            _id: musicData._id
        }, {
            $set: {
                pcat_id: musicData.pcat_id,
                songs_name: musicData.songs_name,
                artist_name: musicData.artist_name,
                karaoke_length: musicData.karaoke_length,
                image_url: musicData.image_url,
                lyrics_url: musicData.lyrics_url,
                file_url: musicData.file_url,
                dance_url: musicData.dance_url,
            }
        }).exec(function(err, u) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                })
            }
            if (!err) {
                if (u.n === 1 && u.nModified === 1) {
                    MusicModel.getMusicDetails(musicData._id, function(musicRes) {
                        if (musicRes) {
                            callback({
                                "response_code": 2000,
                                "response_data": musicRes
                            })
                        }
                    })
                }
            }
        })
    }
    s.statics.getMusicDetails = function(music_id, callback) {
        if (music_id) {
            MusicModel.findOne({
                _id: music_id
            }, function(err, u) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    })
                }
                if (!err) {

                    callback(u);
                }
            })
        }

    }
    s.statics.searchMusic = function(searchData, callback) {
        var ab = ".*" + searchData.search_keyword + ".*";
        var searchTxt = [];
        var andText = [];
        if (searchData.type == "SONG") {
            searchTxt = [
                { songs_name: { '$regex': ab, $options: 'i' } }
            ];
        } else if (searchData.type == "DANCE") {
            searchTxt = [
                { songs_name: { '$regex': ab, $options: 'i' } }
            ];
        } else if (searchData.type == "ARTIST") {
            searchTxt = [
                { artist_name: { '$regex': ab, $options: 'i' } }
            ];
        } else {
            searchTxt = [
                { songs_name: { '$regex': ab, $options: 'i' } },
                { artist_name: { '$regex': ab, $options: 'i' } },
            ];
        }

        MusicModel.find({
            $and: [{
                    $or: searchTxt
                },
                {
                    $or: andText
                }

            ]
        }, function(err, u) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": []
                })
            }

        }).paginate(searchData.page_count, 10, function(err, res, total) {
            // //console.log('total: ', total, 'docs: ', res)
            if (res) {
                // //console.log(res);
                if (res.length === 0) {
                    callback({
                        "response_code": 5002,
                        "response_message": "No result found",
                        "response_data": []
                    })
                } else {
                    callback({
                        "response_code": 2000,
                        "total_records": total,
                        "response_message": "Result found",
                        "response_data": res
                    });
                }
            }
        });
    }


    return s;

}());

module.exports = MusicModel;