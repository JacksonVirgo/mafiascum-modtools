import * as yaml from 'js-yaml';

export function convertYamlToJson(yamlString: string) {
	try {
		const jsonObj = yaml.load(yamlString);
		return jsonObj;
	} catch (error) {
		console.error('Error parsing YAML:', error);
		return null;
	}
}

export function convertJsonToYaml(json: object) {
	try {
		const yamlStr = yaml.dump(json);
		return yamlStr;
	} catch (err) {
		console.error('Error converting json to yaml');
		return null;
	}
}
