<?php
// Test island only data processing
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simulate island only data
$data = [
	'hasIsland' => true,
	'islandDimensions' => [
		'length' => 6,
		'width' => 3
	],
	'customerInfo' => [
		'name' => 'Test User',
		'email' => 'test@example.com'
	],
	'estimate' => [
		'island' => [
			'dimensions' => '6ft × 3ft',
			'price' => 3200
		],
		'total' => [
			'low' => 3200,
			'high' => 3200
		]
	]
];

echo "Testing island only data access...\n\n";

// Test layoutType access
echo "layoutType: ";
var_dump($data['layoutType'] ?? null);

// Test linearFeet access
echo "linearFeet: ";
var_dump($data['linearFeet'] ?? null);

// Test ceilingConfig access
echo "ceilingConfig: ";
var_dump($data['ceilingConfig'] ?? null);

// Test cabinet estimate access
echo "cabinet estimate: ";
var_dump($estimate['cabinet'] ?? null);

// Test database insert values
echo "\nDatabase insert values:\n";
$insert_values = [
	'layout_type' => $data['layoutType'] ?? null,
	'linear_feet' => $data['linearFeet'] ?? null,
	'ceiling_config' => $data['ceilingConfig'] ?? null,
];
var_dump($insert_values);

echo "\nJSON response:\n";
echo json_encode(['success' => true, 'message' => 'Test successful']);
