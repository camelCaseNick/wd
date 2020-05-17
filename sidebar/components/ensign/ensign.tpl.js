templates.ensign = (vars) => { 
	let header = document.createElement('header');
	let title = document.createElement('h1');
	let id = document.createElement('small');
	let space = document.createTextNode(' ');
	let description = document.createElement('p');
	
	let style = document.createElement('link');
	style.setAttribute('rel',  "stylesheet");
	style.setAttribute('href', "components/ensign/ensign.css");
	
	header.classList.add('ensign');

	title.classList.add('ensign__title');
	title.innerText = vars.label;

	id.classList.add('ensign__id');
	let link = document.createElement('a');
	link.classList.add("ensign__id__link")
	link.setAttribute('href', 'https://www.wikidata.org/wiki/' + vars.id);
	link.innerText = vars.id;
	link.addEventListener('click', (e) => {
		e.preventDefault();
    const range = document.createRange();
    range.selectNode(link);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
	});
	id.appendChild(link);



	description.classList.add('ensign__description');
	if (vars.description.provisional) {
		description.classList.add('ensign__description--provisional');

		let descriptionEditFormAppended = false;
		description.addEventListener('click', async () => {
			if (!descriptionEditFormAppended) {
				description.setAttribute('hidden', true);
				let descriptionEditForm = await templates.ensignEditDescription(vars, description);
				header.appendChild(descriptionEditForm);
				descriptionEditFormAppended = true;
			}
		});
	}
	description.innerText = vars.description.text;

	header.appendChild(title);
	header.appendChild(space);
	header.appendChild(id);
	header.appendChild(description);
	header.appendChild(style);

	return header;
}

templates.ensignEditDescription = async (vars, description) => { 
	let descriptionEditForm = document.createElement('form');
	descriptionEditForm.setAttribute('method', 'post');
	descriptionEditForm.setAttribute('action', 'https://www.wikidata.org/w/api.php');
	descriptionEditForm.classList.add('ensign__description-form');

	let token = await getTokens();

	let inputs = {
		'action': {
			value: 'wbsetdescription',
			type: 'hidden',
		},
		'format': {
			value: 'json',
			type: 'hidden',
		},
		'id': {
			value: vars.id,
			type: 'hidden',
		},
		'language': {
			value: lang,
			type: 'hidden',
		},
		'baserevid': {
			value: vars.revid,
			type: 'hidden',
		},
		'bot': {
			value: false,
			type: 'hidden',
		},
		'token': {
	    value: token,
		  type: 'hidden',
		},
		'errorformat': {
			value: 'plaintext',
			type: 'hidden',
		},
		'uselang': {
			value: lang,
			type: 'hidden',
		},
	};

	let button = document.createElement('button');
	button.innerText = '💾';

	let valInput =  document.createElement('input');
	valInput.setAttribute('name', 'value');
	valInput.setAttribute('type', 'text');
	valInput.setAttribute('value', vars.description.text);
	descriptionEditForm.appendChild(valInput);

  for (let [name, input] of Object.entries(inputs)) {
		let newInput =  document.createElement('input');
		newInput.setAttribute('name', name);
		newInput.setAttribute('type', input.type);
		newInput.setAttribute('value', input.value);
		descriptionEditForm.appendChild(newInput);
	}


	descriptionEditForm.appendChild(button);

	descriptionEditForm.addEventListener('submit', async function(e) {
		e.preventDefault();
		const formData = new FormData(descriptionEditForm);

		let response = await fetch(descriptionEditForm.getAttribute('action'), {
			method: 'post',
			body: formData,
		});

		let json = JSON.parse(await response.text());
		if (json.errors) {
			valInput.setCustomValidity(json.errors['0']['*']);
		}
		if (json.success && json.success === 1) {
			description.innerText = valInput.value;
			description.classList.remove('ensign__description--provisional');
			description.removeAttribute('hidden');
			descriptionEditForm.setAttribute('hidden', true);
		}
	});
	
	return descriptionEditForm;
}