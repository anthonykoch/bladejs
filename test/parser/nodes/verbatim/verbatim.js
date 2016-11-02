const value =
`
	@yield('content')
	@section('content')
	@endsection
	@include('daffy')
	@push('scripts')
		<script src="script.js"></script>
	@endpush
`;

module.exports = {
	type: 'VerbatimStatement',
	value,
	line: 1,
	start: 0,
	end: 158
};
