export const storage = {
	get: prop => {
		return storage.localStorage ? storage.localStorage.getItem(prop) : storage.cookie.get(prop);
	},
	set: (prop, val) => {
		return storage.localStorage ? storage.localStorage.setItem(prop, val) : storage.cookie.set(prop, val);
	},
	delete: prop => {
		return storage.localStorage ? storage.localStorage.removeItem(prop) : storage.cookie.delete(prop);
	},
	localStorage: (() => {
		const uid = new Date();

		try {
			window.localStorage.setItem(uid, uid);

			const result = !!window.localStorage.getItem(uid);

			window.localStorage.removeItem(uid);

			return result && window.localStorage;
		} catch (err) {
			return null;
		}
	})(),
	cookie: {
		get: cookieName => {
			const cookieArr = document.cookie.split(/;\s?/g);
			const cookieCount = cookieArr.length;
			let cookie, x;

			for (x = 0; x < cookieCount; ++x) {
				cookie = cookieArr[x];

				if (cookie.startsWith(`${cookieName}=`)) return cookie.replace(`${cookieName}=`, '');
			}

			return undefined;
		},
		set: (cookieName, cookieValue, expHours) => {
			let cookie = cookieName + '=' + cookieValue;

			if (expHours) {
				const date = new Date();

				date.setTime(date.getTime() + (expHours || 1) * 60 * 60 * 1000);

				cookie += `; expires=${date.toUTCString()}`;
			}

			document.cookie = `${cookie};`;
		},
		delete: name => {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
		},
	},
};
