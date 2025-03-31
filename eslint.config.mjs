import config from '@mheob/eslint-config';

export default config(
	{
		yaml: true,
	},
	{
		files: ['*.json', '.github/renovate.json'],
		ignores: ['package*.json'],
		rules: {
			'jsonc/sort-keys': [
				'error',
				{
					hasProperties: ['$schema'],
					order: [
						'$schema',
						'description',
						'extends',
						'onboardingConfigFileName',
						'lockFileMaintenance',
						'packageRules',
					],
					pathPattern: '.*',
				},
				{
					order: { type: 'asc' },
					pathPattern: '.*',
				},
			],
		},
	},
);
