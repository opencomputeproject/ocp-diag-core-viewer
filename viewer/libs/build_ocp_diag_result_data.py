from viewer.libs.classifier import ResultClassifier
from viewer.libs.processor import Processor


def build_ocp_diag_test_data_js(ocp_diag_data_content: str) -> list[str]:
    """Builds a valid OCP diag result record based on ocp_diag_data_content"""
    record_builder = ResultClassifier().classify(ocp_diag_data_content)
    processor = Processor(record_builder)
    for index, line in enumerate(ocp_diag_data_content.splitlines()):
        processor.add(line, index)

    processor.validate()
    return processor.records
