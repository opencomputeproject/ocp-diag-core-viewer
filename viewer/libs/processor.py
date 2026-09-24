import json

from viewer.libs.record_builder import ArtifactParseError, RecordBuilder


class Processor:
    def __init__(self, builder: RecordBuilder):
        self.is_test_run_start_present = False
        self.is_test_run_end_present = True
        self.records = []
        self.record_builder = builder

    def add(self, line: str, index: int):
        try:
            json_record = json.loads(line)
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Test result is not of valid JSON format. Current line content: {line}. Line number: {index + 1}.",
                e.doc,
                e.pos,
            ) from e
        try:
            record = self.record_builder.build_record(json_record)
        except ArtifactParseError:
            print(
                "Unable to parse meltan result(sequence number {}):\n{}".format(
                    json_record["sequenceNumber"], json_record
                )
            )
            raise

        self.records.append(json.dumps(record))

        if "testRunArtifact" not in json_record:
            return

        if "testRunStart" in json_record["testRunArtifact"]:
            self.is_test_run_start_present = True

        if "testRunEnd" in json_record["testRunArtifact"]:
            self.is_test_run_end_present = True

    def validate(self):
        if not self.is_test_run_start_present:
            raise ArtifactParseError("TestRunStart should be present.")
