import { SET_PLACES, REMOVE_PLACE } from './actionTypes';
import { uiStartLoading, uiStopLoading } from './index';

export const addPlace = (placeName, location, image) => {
	return dispatch => {
		dispatch(uiStartLoading());
		fetch('https://us-central1-awesome-places-1546892091767.cloudfunctions.net/storeImage', {
			method: 'POST',
			body: JSON.stringify({
				image: image.base64
			})
		})
			.catch(err => {
				console.log(err);
				alert('Something went wrong, please try again!');
				dispatch(uiStopLoading());
			})
			.then(res => res.json())
			.then(parsedRes => {
				const placeData = {
					name: placeName,
					location: location,
					image: parsedRes.imageUrl
				};
				return fetch('https://awesome-places-1546892091767.firebaseio.com/places.json', {
					method: 'POST',
					body: JSON.stringify(placeData)
				});
			})
			.then(res => res.json())
			.then(parsedRes => {
				console.log(parsedRes);
				dispatch(uiStopLoading());
			})
			.catch(err => {
				console.log(err);
				alert('Something went wrong, please try again!');
				dispatch(uiStopLoading());
			});
	};
};

export const getPlaces = () => {
	return (dispatch, getState) => {
		const token = getState().auth.token;
		if (!token) {
			//should never reach since got past auth screen
			return;
		}
		fetch('https://awesome-places-1546892091767.firebaseio.com/places.json?auth=' + token)
			.then(res => res.json())
			.then(parsedRes => {
				const places = [];
				for (let key in parsedRes) {
					places.push({
						...parsedRes[key],
						image: {
							uri: parsedRes[key].image
						},
						key: key
					});
				}
				dispatch(setPlaces(places));
			})
			.catch(err => {
				alert('Something went wrong, sorry :/');
				console.log(err);
			});
	};
};

export const setPlaces = places => {
	return {
		type: SET_PLACES,
		places: places
	};
};

export const deletePlace = key => {
	return dispatch => {
		dispatch(removePlace(key));
		fetch('https://awesome-places-1546892091767.firebaseio.com/places/' + key + '.json', {
			method: 'DELETE'
		})
			.then(res => res.json())
			.then(parsedRes => {
				console.log('Done!');
			})
			.catch(err => {
				alert('Something went wrong, sorry :/');
				console.log(err);
			});
	};
};

export const removePlace = key => {
	return {
		type: REMOVE_PLACE,
		key: key
	};
};
